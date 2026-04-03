package com.studenttracker.backend.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.studenttracker.backend.dto.request.ChangePasswordRequest;
import com.studenttracker.backend.dto.request.LoginRequest;
import com.studenttracker.backend.dto.request.RegisterRequest;
import com.studenttracker.backend.dto.response.AuthResponse;
import com.studenttracker.backend.exception.ConflictException;
import com.studenttracker.backend.exception.NotFoundException;
import com.studenttracker.backend.exception.UnauthorizedException;
import com.studenttracker.backend.model.RefreshToken;
import com.studenttracker.backend.model.Role;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.repository.UserRepository;
import com.studenttracker.backend.security.PasswordResetRateLimiter;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email)) {
            throw new ConflictException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.email);
        user.setPassword(passwordEncoder.encode(request.password));
        user.setFirstName(request.firstName);
        user.setLastName(request.lastName);
        user.setRole(Role.USER);

        userRepository.save(user);

        // Issue both access token and refresh token
        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createToken(user);

        return new AuthResponse(accessToken, refreshToken.getToken());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password, user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        // Issue both access token and refresh token
        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createToken(user);

        return new AuthResponse(accessToken, refreshToken.getToken());
    }

    /**
     * Logs out a user by invalidating all their tokens
     * Uses token version incrementing to invalidate existing access tokens without database queries
     * Also explicitly revokes all refresh tokens from the database
     *
     * Security: Increments tokenVersion so JwtFilter rejects old access tokens,
     * and revokes refresh tokens to prevent token rotation attacks
     */
    public void logout(User user) {
        // Increment token version to invalidate all access tokens immediately
        user.incrementTokenVersion();
        userRepository.save(user);

        // Revoke all refresh tokens for this user to prevent further token refresh
        refreshTokenService.revokeAllUserTokens(user);
    }

    public User getCurrentUser() {
        Object principal = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        if (principal instanceof UserDetails userDetails) {
            return userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new NotFoundException("User not found"));
        }

        throw new UnauthorizedException("User not authenticated");
    }

    /**
     * Changes a user's password with comprehensive validation
     * Validates current password, new password confirmation, and enforces rate limiting
     *
     * Security checks:
     * 1. Verify user identity via current password (prevent account hijacking)
     * 2. Ensure new password matches confirmation (prevent typos)
     * 3. Prevent reusing current password (enforces actual change)
     * 4. Rate limit password changes (prevent automated attacks)
     *
     * @param request Contains currentPassword, newPassword, confirmPassword
     * @throws UnauthorizedException if any validation fails
     */
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();

        // Security: Verify current password to confirm user identity
        if (!passwordEncoder.matches(request.currentPassword, user.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        // Data validation: Ensure new password matches confirmation
        if (!request.newPassword.equals(request.confirmPassword)) {
            throw new UnauthorizedException("New passwords do not match");
        }

        // Security: Prevent using the same password (enforce actual change)
        if (passwordEncoder.matches(request.newPassword, user.getPassword())) {
            throw new UnauthorizedException("New password must be different from current password");
        }

        // Security: Check rate limit to prevent brute force attacks
        PasswordResetRateLimiter.checkRateLimit(user);

        // Update password and record attempt for rate limiting
        user.setPassword(passwordEncoder.encode(request.newPassword));
        PasswordResetRateLimiter.recordAttempt(user);
        userRepository.save(user);
    }

    /**
     * Generates a new access token for the given user
     * Used when refreshing tokens or during login
     *
     * @param user The user to generate token for
     * @return New access token
     */
    public String generateAccessToken(User user) {
        return jwtService.generateToken(user);
    }
}
