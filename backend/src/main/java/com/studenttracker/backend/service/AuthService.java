package com.studenttracker.backend.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.studenttracker.backend.dto.request.LoginRequest;
import com.studenttracker.backend.dto.request.RegisterRequest;
import com.studenttracker.backend.dto.response.AuthResponse;
import com.studenttracker.backend.exception.ConflictException;
import com.studenttracker.backend.exception.NotFoundException;
import com.studenttracker.backend.exception.UnauthorizedException;
import com.studenttracker.backend.model.Role;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.repository.UserRepository;

@Service
public class AuthService {
    

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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

        return new AuthResponse(jwtService.generateToken(user));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password, user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return new AuthResponse(jwtService.generateToken(user));
    }

    public void logout(User user) {
        user.incrementTokenVersion();
        userRepository.save(user);
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
}
