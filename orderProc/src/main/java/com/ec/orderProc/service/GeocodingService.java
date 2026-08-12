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

    @Value("${geocoding.api.url:https://nominatim.openstreetmap.org}")
    private String nominatingUrl;

    @Value("${geocoding.user-agent:OrderProcessingApp/1.0}")
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

        redisTemplate.opsForValue().set(cacheKey, result.lat() + "," + result.lng(), Duration.ofDays(30));
        return result;
    }

    private Coordinates geocodeUncached(String address) {
        // --- LAYER 1: Full Address Query ---
        try {
            return executeQuery(address);
        } catch (GeocodingException e) {
            /* continue */ }

        // --- LAYER 2: PIN Code Extraction (e.g., "India 201301") ---
        Pattern pinPattern = Pattern.compile("\\b\\d{6}\\b");
        Matcher pinMatcher = pinPattern.matcher(address);
        if (pinMatcher.find()) {
            String pincode = pinMatcher.group();
            try {
                return executeQuery("India " + pincode);
            } catch (GeocodingException e) {
                /* continue */ }
        }

        // --- LAYER 3: Cleaned Address Layout ---
        String cleanAddress = address
                .replaceAll("(?i)(flat|apt|apartment|room|floor|house|plot|shop|block|phase)\\s*\\w*\\s*,?", "")
                .replaceAll("(?i)(near|opposite|behind)\\s+[^,]+,?", "")
                .trim();
        try {
            return executeQuery(cleanAddress);
        } catch (GeocodingException e) {
            /* continue */ }

        // --- LAYER 4: City Extractor ---
        String[] parts = address.split(",");
        if (parts.length >= 2) {
            String broadArea = parts[parts.length - 2].trim() + ", " + parts[parts.length - 1].trim();
            try {
                return executeQuery(broadArea);
            } catch (GeocodingException e) {
                /* continue */ }
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

    private Coordinates executeQuery(String queryText) {
        URI uri = UriComponentsBuilder.fromUriString(nominatingUrl + "/search")
                .queryParam("q", queryText)
                .queryParam("format", "json")
                .queryParam("limit", 1)
                .build()
                .encode()
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.USER_AGENT, userAgent);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
            JsonNode results = objectMapper.readTree(response.getBody());

            if (!results.isArray() || results.isEmpty()) {
                System.out.println(
                        "[Geocoding] Empty results for query: " + queryText + " | raw response: " + response.getBody());
                throw new GeocodingException(queryText);
            }

            JsonNode first = results.get(0);
            double lat = first.get("lat").asDouble();
            double lng = first.get("lon").asDouble();
            return new Coordinates(lat, lng);

        } catch (GeocodingException ge) {
            throw ge;
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("[Geocoding] executeQuery failed for '" + queryText + "': "
                    + e.getClass().getSimpleName() + " - " + e.getMessage());
            throw new GeocodingException(queryText);
        }
    }
}