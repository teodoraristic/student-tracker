package com.studenttracker.backend.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.studenttracker.backend.exception.UnauthorizedException;
import com.studenttracker.backend.model.RefreshToken;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.repository.RefreshTokenRepository;

/**
 * Manages refresh tokens with rotation support
 * Implements secure token rotation: old tokens are revoked when new ones are issued
 */
@Service
public class RefreshTokenService {
    private static final long REFRESH_TOKEN_EXPIRY_DAYS = 30; // 30 days

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /**
     * Creates a new refresh token for the user
     *
     * @param user The user to create token for
     * @return New refresh token
     */
    public RefreshToken createToken(User user) {
        String tokenValue = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plusSeconds(REFRESH_TOKEN_EXPIRY_DAYS * 24 * 3600);

        RefreshToken refreshToken = new RefreshToken(user, tokenValue, expiresAt);
        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * Validates a refresh token and returns the associated user
     * Checks that token is not expired and not revoked
     *
     * @param tokenValue The refresh token value
     * @return The associated User
     * @throws UnauthorizedException if token is invalid
     */
    public User validateToken(String tokenValue) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (refreshToken.isExpired()) {
            throw new UnauthorizedException("Refresh token has expired");
        }

        if (refreshToken.isRevoked()) {
            throw new UnauthorizedException("Refresh token has been revoked");
        }

        return refreshToken.getUser();
    }

    /**
     * Implements refresh token rotation:
     * 1. Validates the old token
     * 2. Issues a new refresh token
     * 3. Revokes the old token
     * This prevents token reuse attacks
     *
     * @param oldTokenValue The current refresh token
     * @return New refresh token
     */
    public RefreshToken rotateToken(String oldTokenValue) {
        // Validate old token and get user
        User user = validateToken(oldTokenValue);

        // Get the old token entity to revoke it
        RefreshToken oldToken = refreshTokenRepository.findByToken(oldTokenValue)
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found"));

        // Create new token
        RefreshToken newToken = createToken(user);

        // Revoke old token (after creating new one to prevent race conditions)
        oldToken.setRevokedAt(Instant.now());
        refreshTokenRepository.save(oldToken);

        return newToken;
    }

    /**
     * Revokes a refresh token (e.g., on logout)
     *
     * @param tokenValue The token to revoke
     */
    public void revokeToken(String tokenValue) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found"));

        refreshToken.setRevokedAt(Instant.now());
        refreshTokenRepository.save(refreshToken);
    }

    /**
     * Revokes all refresh tokens for a user (e.g., on logout)
     *
     * @param user The user whose tokens should be revoked
     */
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.deleteByUser(user);
    }
}
