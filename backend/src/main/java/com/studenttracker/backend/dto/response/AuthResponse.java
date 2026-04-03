package com.studenttracker.backend.dto.response;

public class AuthResponse {
    public String accessToken;
    public String refreshToken;

    // Constructor for backwards compatibility (access token only)
    public AuthResponse(String accessToken) {
        this.accessToken = accessToken;
        this.refreshToken = null;
    }

    // Constructor for access token + refresh token
    public AuthResponse(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
