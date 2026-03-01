package com.studenttracker.backend.service;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.studenttracker.backend.model.Role;
import com.studenttracker.backend.model.User;

class JwtServiceTest {

    private JwtService jwtService;

    // Minimum 32-byte secret required for HS256
    private static final String TEST_SECRET = "test-secret-key-for-unit-tests-abc123!!";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "SECRET_KEY", TEST_SECRET);
    }

    @Test
    void generateToken_returnsNonNullToken() {
        User user = makeUser("alice@example.com", Role.USER);

        String token = jwtService.generateToken(user);

        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    void generateToken_thenExtractUsername_returnsCorrectEmail() {
        User user = makeUser("alice@example.com", Role.USER);

        String token = jwtService.generateToken(user);
        String extracted = jwtService.extractUsername(token);

        assertThat(extracted).isEqualTo("alice@example.com");
    }

    @Test
    void generateToken_differentUsers_produceDifferentTokens() {
        User alice = makeUser("alice@example.com", Role.USER);
        User bob = makeUser("bob@example.com", Role.USER);

        String tokenA = jwtService.generateToken(alice);
        String tokenB = jwtService.generateToken(bob);

        assertThat(tokenA).isNotEqualTo(tokenB);
    }

    // ── helper ────────────────────────────────────────────────────────────────

    private User makeUser(String email, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setRole(role);
        return user;
    }
}
