package com.studenttracker.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import com.studenttracker.backend.dto.UserDTO;
import com.studenttracker.backend.dto.request.LoginRequest;
import com.studenttracker.backend.dto.request.RegisterRequest;
import com.studenttracker.backend.dto.response.AuthResponse;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
 
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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
}
