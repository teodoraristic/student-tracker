package com.studenttracker.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import com.studenttracker.backend.dto.UserDTO;
import com.studenttracker.backend.dto.request.ChangePasswordRequest;
import com.studenttracker.backend.dto.request.ForgotPasswordRequest;
import com.studenttracker.backend.dto.request.LoginRequest;
import com.studenttracker.backend.dto.request.RefreshTokenRequest;
import com.studenttracker.backend.dto.request.RegisterRequest;
import com.studenttracker.backend.dto.request.ResetPasswordRequest;
import com.studenttracker.backend.dto.response.AuthResponse;
import com.studenttracker.backend.dto.response.TokenRefreshResponse;
import com.studenttracker.backend.model.RefreshToken;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.service.AuthService;
import com.studenttracker.backend.service.RefreshTokenService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;

    public AuthController(AuthService authService, RefreshTokenService refreshTokenService) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    public void logout() {
        User user = authService.getCurrentUser();
        authService.logout(user);
    }

    @GetMapping("/me")
    public UserDTO getCurrentUser() {
        User user = authService.getCurrentUser();
        return new UserDTO(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName());
    }

    @PostMapping("/change-password")
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
    }

    @PostMapping("/refresh")
    public TokenRefreshResponse refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        User user = refreshTokenService.validateToken(request.refreshToken);
        String newAccessToken = authService.generateAccessToken(user);
        RefreshToken newRefreshToken = refreshTokenService.rotateToken(request.refreshToken);
        return new TokenRefreshResponse(newAccessToken, newRefreshToken.getToken());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        // Always 200 — don't reveal if email exists
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/account")
    public ResponseEntity<Void> deleteAccount() {
        authService.deleteAccount();
        return ResponseEntity.noContent().build();
    }
}
