package com.ec.orderProc.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.ec.orderProc.exception.GeocodingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GeocodingService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${geocoding.nominating-url}")
    private String nominatingUrl;

    @Value("${geocoding.user-agent}")
    private String userAgent;

    public record Coordinates(double lat, double lng) {
    }

    public Coordinates geocode(String address) {
        String url = UriComponentsBuilder.fromUriString(nominatingUrl + "/serach")
                .queryParam("q", address)
                .queryParam("format", "json")
                .queryParam("limit", 1)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.USER_AGENT, userAgent);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

        try {
            JsonNode results = objectMapper.readTree(response.getBody());
            if (!results.isArray() || results.isEmpty()) {
                throw new GeocodingException(address);
            }

            JsonNode first = results.get(0);
            double lat = first.get("lat").asDouble();
            double lng = first.get("lon").asDouble();
            return new Coordinates(lat, lng);

        } catch (Exception e) {
            throw new GeocodingException(address);
        }
    }

}
