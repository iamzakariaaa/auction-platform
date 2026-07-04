package com.iamzakaria.auctionplatform.security.jwt;

import com.iamzakaria.auctionplatform.security.SecurityUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.Date;
@Service
public class JwtService {

    private final JwtProperties properties;
    private final Clock clock;
    private final SecretKey signingKey;

    public JwtService(
            JwtProperties properties,
            Clock clock
    ) {
        this.properties = properties;
        this.clock = clock;
        this.signingKey = Keys.hmacShaKeyFor(
                properties.secret()
                        .getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(SecurityUser user) {
        Instant issuedAt = Instant.now(clock);
        Instant expiresAt = issuedAt.plusMillis(
                properties.expiration()
        );

        return Jwts.builder()
                .subject(user.getUsername())
                .claim("userId", user.getId().toString())
                .claim(
                        "authorities",
                        user.getAuthorities()
                                .stream()
                                .map(GrantedAuthority::getAuthority
                                )
                                .toList()
                )
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiresAt))
                .signWith(signingKey)
                .compact();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(
            String token,
            SecurityUser user
    ) {
        try {
            Claims claims = extractAllClaims(token);

            String username = claims.getSubject();
            Date expiration = claims.getExpiration();

            return username != null
                    && username.equals(user.getUsername())
                    && expiration != null
                    && expiration.after(
                    Date.from(Instant.now(clock))
            )
                    && user.isEnabled();

        } catch (JwtException | IllegalArgumentException exception) {
            return false;
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getExpiration() {
        return properties.expiration();
    }
}