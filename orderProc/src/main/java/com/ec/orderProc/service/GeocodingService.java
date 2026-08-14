package com.ec.orderProc.service;

import com.ec.orderProc.exception.GeocodingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GeocodingService {

    private final RestTemplate restTemplate;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${geocoding.nominating-url:https://nominatim.openstreetmap.org}")
    private String nominatingUrl;

    @Value("${geocoding.user-agent}")
    private String userAgent;

    public GeocodingService(RestTemplate restTemplate, ObjectMapper objectMapper, StringRedisTemplate redisTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.redisTemplate = redisTemplate;
    }

    public record Coordinates(double lat, double lng) {
    }

    public Coordinates geocode(String address) {
        String cacheKey = "geocode:" + address.toLowerCase().trim();
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            String[] parts = cached.split(",");
            return new Coordinates(Double.parseDouble(parts[0]), Double.parseDouble(parts[1]));
        }

        long start = System.currentTimeMillis();
        Coordinates result = geocodeUncached(address);
        System.out.println("[Geocoding] Took " + (System.currentTimeMillis() - start) + "ms for: " + address);

        boolean isFallback = result.lat() == 28.6139 && result.lng() == 77.2090;
        if (!isFallback) {
            redisTemplate.opsForValue().set(cacheKey, result.lat() + "," + result.lng(), Duration.ofDays(30));
        }

        return result;
    }

    private Coordinates geocodeUncached(String address) {
        // --- LAYER 1: Full Address Query ---
        try {
            return executeQuery(address);
        } catch (GeocodingException e) {
            sleep();
        }

        // --- LAYER 2: PIN Code Extraction (e.g., "India 201301") ---
        Pattern pinPattern = Pattern.compile("\\b\\d{6}\\b");
        Matcher pinMatcher = pinPattern.matcher(address);
        if (pinMatcher.find()) {
            String pincode = pinMatcher.group();
            try {
                return executeQuery("India " + pincode);
            } catch (GeocodingException e) {
                sleep();
            }
        }

        // --- LAYER 3: Cleaned Address Layout ---
        String cleanAddress = address
                .replaceAll("(?i)(flat|apt|apartment|room|floor|house|plot|shop|block|phase)\\s*\\w*\\s*,?", "")
                .replaceAll("(?i)(near|opposite|behind)\\s+[^,]+,?", "")
                .trim();
        try {
            return executeQuery(cleanAddress);
        } catch (GeocodingException e) {
            sleep();
        }

        // --- LAYER 4: City Extractor (comma-based) ---
        String[] parts = address.split(",");
        if (parts.length >= 2) {
            String broadArea = parts[parts.length - 2].trim() + ", " + parts[parts.length - 1].trim();
            try {
                return executeQuery(broadArea);
            } catch (GeocodingException e) {
                sleep();
            }
        }

        // --- LAYER 4b: City Extractor (space-based, for comma-less addresses) ---
        String[] words = address.trim().split("\\s+");
        if (words.length >= 2) {
            String lastTwoWords = words[words.length - 2] + " " + words[words.length - 1];
            try {
                return executeQuery(lastTwoWords);
            } catch (GeocodingException e) {
                sleep();
            }
        }
        // --- LAYER 5: ULTIMATE FALLBACK SAFETY NET ---
        System.out.println("[Geocoding] API failed for address. Applying default safety coordinates.");

        if (address.toLowerCase().contains("noida") || address.toLowerCase().contains("uttar pradesh")) {
            return new Coordinates(28.5355, 77.3910);
        } else if (address.toLowerCase().contains("delhi")) {
            return new Coordinates(28.6139, 77.2090);
        }

        return new Coordinates(28.6139, 77.2090);
    }

    private void sleep() {
        try {
            Thread.sleep(1100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private Coordinates executeQuery(String queryText) {
        URI uri = UriComponentsBuilder.fromUriString(nominatingUrl + "/api")
                .queryParam("q", queryText)
                .queryParam("limit", 1)
                .build()
                .encode()
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.USER_AGENT, userAgent);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        int maxAttempts = 3;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode features = root.path("features");

                if (features.isMissingNode() || !features.isArray() || features.isEmpty()) {
                    throw new GeocodingException(queryText);
                }

                JsonNode coordinates = features.get(0).path("geometry").path("coordinates");
                return new Coordinates(coordinates.get(1).asDouble(), coordinates.get(0).asDouble());

            } catch (GeocodingException ge) {
                throw ge; // genuine "no results" - retrying won't help, fail fast
            } catch (Exception e) {
                System.out.println("[Geocoding] Attempt " + attempt + "/" + maxAttempts + " failed for '"
                        + queryText + "': " + e.getClass().getSimpleName());
                if (attempt == maxAttempts) {
                    throw new GeocodingException(queryText);
                }
                try {
                    Thread.sleep(1000L * attempt); // 1s, then 2s backoff
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        throw new GeocodingException(queryText); // unreachable, satisfies compiler
    }
}