package com.studenttracker.backend.security;

import java.time.Duration;
import java.time.Instant;

import com.studenttracker.backend.exception.UnauthorizedException;
import com.studenttracker.backend.model.User;

/**
 * Rate limiter for password reset attempts
 * Limits users to max 3 password resets per hour per email
 */
public class PasswordResetRateLimiter {
    private static final int MAX_ATTEMPTS = 3;
    private static final long WINDOW_DURATION_SECONDS = 3600; // 1 hour

    public static void checkRateLimit(User user) {
        Instant now = Instant.now();
        Instant lastResetTime = user.getLastPasswordResetTime();
        int resetCount = user.getPasswordResetCount();

        // If no previous resets, allow
        if (lastResetTime == null) {
            return;
        }

        // Calculate time elapsed since first reset in window
        long elapsedSeconds = Duration.between(lastResetTime, now).getSeconds();

        // Reset counter if window has passed
        if (elapsedSeconds > WINDOW_DURATION_SECONDS) {
            user.resetPasswordResetAttempts();
            return;
        }

        // Check if limit exceeded within window
        if (resetCount >= MAX_ATTEMPTS) {
            long remainingSeconds = WINDOW_DURATION_SECONDS - elapsedSeconds;
            long remainingMinutes = (remainingSeconds + 59) / 60; // Round up
            throw new UnauthorizedException(
                "Too many password reset attempts. Please try again in " + remainingMinutes + " minute(s)."
            );
        }
    }

    public static void recordAttempt(User user) {
        user.incrementPasswordResetAttempts();
    }
}
