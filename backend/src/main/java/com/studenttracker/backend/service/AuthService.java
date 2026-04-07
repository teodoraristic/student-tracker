package com.studenttracker.backend.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studenttracker.backend.dto.request.ChangePasswordRequest;
import com.studenttracker.backend.dto.request.ForgotPasswordRequest;
import com.studenttracker.backend.dto.request.LoginRequest;
import com.studenttracker.backend.dto.request.RegisterRequest;
import com.studenttracker.backend.dto.request.ResetPasswordRequest;
import com.studenttracker.backend.dto.response.AuthResponse;
import com.studenttracker.backend.exception.ConflictException;
import com.studenttracker.backend.exception.NotFoundException;
import com.studenttracker.backend.exception.UnauthorizedException;
import com.studenttracker.backend.model.RefreshToken;
import com.studenttracker.backend.model.Role;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.repository.ExamPeriodRepository;
import com.studenttracker.backend.repository.RefreshTokenRepository;
import com.studenttracker.backend.repository.SemesterRepository;
import com.studenttracker.backend.repository.StudySessionRepository;
import com.studenttracker.backend.repository.SubjectRepository;
import com.studenttracker.backend.repository.UserRepository;
import com.studenttracker.backend.security.PasswordResetRateLimiter;

@Service
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCK_DURATION_MINUTES = 15;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;
    private final SubjectRepository subjectRepository;
    private final SemesterRepository semesterRepository;
    private final ExamPeriodRepository examPeriodRepository;
    private final StudySessionRepository studySessionRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       RefreshTokenService refreshTokenService,
                       EmailService emailService,
                       SubjectRepository subjectRepository,
                       SemesterRepository semesterRepository,
                       ExamPeriodRepository examPeriodRepository,
                       StudySessionRepository studySessionRepository,
                       RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.emailService = emailService;
        this.subjectRepository = subjectRepository;
        this.semesterRepository = semesterRepository;
        this.examPeriodRepository = examPeriodRepository;
        this.studySessionRepository = studySessionRepository;
        this.refreshTokenRepository = refreshTokenRepository;
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

        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createToken(user);

        return new AuthResponse(accessToken, refreshToken.getToken());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        // Check if account is temporarily locked
        if (user.isLocked()) {
            long minutesLeft = (user.getLockedUntil().getEpochSecond() - Instant.now().getEpochSecond()) / 60 + 1;
            throw new UnauthorizedException(
                "Too many failed login attempts. Try again in " + minutesLeft + " minute(s)."
            );
        }

        if (!passwordEncoder.matches(request.password, user.getPassword())) {
            recordFailedLogin(user);
            throw new UnauthorizedException("Invalid credentials");
        }

        // Successful login — reset failed attempts
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createToken(user);

        return new AuthResponse(accessToken, refreshToken.getToken());
    }

    private void recordFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            user.setLockedUntil(Instant.now().plusSeconds(LOCK_DURATION_MINUTES * 60));
        }
        userRepository.save(user);
    }

    /**
     * Logs out a user by invalidating all their tokens.
     */
    public void logout(User user) {
        user.incrementTokenVersion();
        userRepository.save(user);
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
     * Initiates a password reset by emailing a token.
     * Always returns success to avoid revealing if email exists.
     */
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.email).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            user.setPasswordResetTokenExpiry(Instant.now().plusSeconds(15 * 60)); // 15 min
            userRepository.save(user);
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), token);
        });
    }

    /**
     * Completes a password reset using the token from the email.
     */
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.token)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired reset link"));

        if (user.getPasswordResetTokenExpiry() == null ||
                Instant.now().isAfter(user.getPasswordResetTokenExpiry())) {
            throw new UnauthorizedException("Invalid or expired reset link");
        }

        if (!request.newPassword.equals(request.confirmPassword)) {
            throw new UnauthorizedException("Passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        // Invalidate all existing sessions after password reset
        user.incrementTokenVersion();
        userRepository.save(user);
        refreshTokenService.revokeAllUserTokens(user);
    }

    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();

        if (!passwordEncoder.matches(request.currentPassword, user.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        if (!request.newPassword.equals(request.confirmPassword)) {
            throw new UnauthorizedException("New passwords do not match");
        }

        if (passwordEncoder.matches(request.newPassword, user.getPassword())) {
            throw new UnauthorizedException("New password must be different from current password");
        }

        PasswordResetRateLimiter.checkRateLimit(user);

        user.setPassword(passwordEncoder.encode(request.newPassword));
        PasswordResetRateLimiter.recordAttempt(user);
        userRepository.save(user);
    }

    /**
     * Permanently deletes the authenticated user's account and all associated data.
     */
    @Transactional
    public void deleteAccount() {
        User user = getCurrentUser();

        // Delete in FK-safe order: tokens → sessions → subjects (→ tasks → subtasks) → semesters → exam periods → user
        refreshTokenRepository.deleteByUser(user);
        studySessionRepository.deleteByUser(user);
        subjectRepository.deleteAllByUser(user);
        semesterRepository.deleteAllByUser(user);
        examPeriodRepository.deleteAllByUser(user);
        userRepository.delete(user);
    }

    public String generateAccessToken(User user) {
        return jwtService.generateToken(user);
    }
}
