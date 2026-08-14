package com.ec.orderProc.security;

import com.ec.orderProc.service.SessionService;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final SessionService sessionService;
    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService, SessionService sessionService) {
        this.jwtService = jwtService;
        this.sessionService = sessionService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                Claims claims = jwtService.parseClaims(token);
                String userId = claims.getSubject();
                String role = claims.get("role", String.class);
                String tokenId = claims.getId();

                if (!sessionService.isActiveSession(UUID.fromString(userId), tokenId)) {
                    // Stop further processing if session is inactive
                    filterChain.doFilter(request, response);
                    return;
                }

                List<SimpleGrantedAuthority> authorities;
                if (role != null && !role.isBlank()) {
                    String finalRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                    authorities = List.of(new SimpleGrantedAuthority(finalRole));
                } else {
                    authorities = Collections.emptyList();
                }

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userId, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authToken);

            } catch (JwtException e) {
                // Change: Clear security context if token manipulation or expiration occurs
                SecurityContextHolder.clearContext();
                // Optional: You can send a 401 error directly here if preferred:
                // response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT Token");
                // return;
            }
        }
        filterChain.doFilter(request, response);
    }
}
