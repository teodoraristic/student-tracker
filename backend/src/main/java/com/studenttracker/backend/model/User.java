package com.studenttracker.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String firstName;
    private String lastName;
    
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int tokenVersion = 0;

    @Column
    private Instant lastPasswordResetTime;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int passwordResetCount = 0;

    public User() {
    }
    
    public User(String email, String password, String firstName, String lastName) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    public String getLastName() {
        return lastName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public int getTokenVersion() {
        return tokenVersion;
    }

    public void incrementTokenVersion() {
        this.tokenVersion++;
    }

    public Instant getLastPasswordResetTime() {
        return lastPasswordResetTime;
    }

    public void setLastPasswordResetTime(Instant lastPasswordResetTime) {
        this.lastPasswordResetTime = lastPasswordResetTime;
    }

    public int getPasswordResetCount() {
        return passwordResetCount;
    }

    public void setPasswordResetCount(int passwordResetCount) {
        this.passwordResetCount = passwordResetCount;
    }

    public void resetPasswordResetAttempts() {
        this.passwordResetCount = 0;
        this.lastPasswordResetTime = null;
    }

    public void incrementPasswordResetAttempts() {
        this.passwordResetCount++;
        this.lastPasswordResetTime = Instant.now();
    }
}
