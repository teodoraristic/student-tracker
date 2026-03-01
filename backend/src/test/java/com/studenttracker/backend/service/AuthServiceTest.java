package com.studenttracker.backend.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.studenttracker.backend.dto.request.LoginRequest;
import com.studenttracker.backend.dto.request.RegisterRequest;
import com.studenttracker.backend.dto.response.AuthResponse;
import com.studenttracker.backend.exception.ConflictException;
import com.studenttracker.backend.exception.UnauthorizedException;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    // ── register ─────────────────────────────────────────────────────────────

    @Test
    void register_success_returnsToken() {
        RegisterRequest request = new RegisterRequest();
        request.email = "john@example.com";
        request.password = "password123";
        request.firstName = "John";
        request.lastName = "Doe";

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertThat(response.token).isEqualTo("jwt-token");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_duplicateEmail_throwsConflict() {
        RegisterRequest request = new RegisterRequest();
        request.email = "john@example.com";
        request.password = "password123";
        request.firstName = "John";
        request.lastName = "Doe";

        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Email already exists");

        verify(userRepository, never()).save(any());
    }

    // ── login ─────────────────────────────────────────────────────────────────

    @Test
    void login_success_returnsToken() {
        LoginRequest request = new LoginRequest();
        request.email = "john@example.com";
        request.password = "password123";

        User user = new User();
        user.setEmail("john@example.com");
        user.setPassword("hashed");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertThat(response.token).isEqualTo("jwt-token");
    }

    @Test
    void login_emailNotFound_throwsUnauthorized() {
        LoginRequest request = new LoginRequest();
        request.email = "ghost@example.com";
        request.password = "password123";

        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    void login_wrongPassword_throwsUnauthorized() {
        LoginRequest request = new LoginRequest();
        request.email = "john@example.com";
        request.password = "wrong";

        User user = new User();
        user.setEmail("john@example.com");
        user.setPassword("hashed");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid credentials");
    }
}
