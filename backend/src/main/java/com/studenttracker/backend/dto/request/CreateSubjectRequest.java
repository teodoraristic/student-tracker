package com.studenttracker.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreateSubjectRequest {

    @NotBlank(message = "Subject name is required")
    private String name;

    private String website;

    private Long semesterId;

    public CreateSubjectRequest() {}

    public String getName() {
        return name;
    }

    public String getWebsite() {
        return website;
    }

    public Long getSemesterId() {
        return semesterId;
    }

    public void setSemesterId(Long semesterId) {
        this.semesterId = semesterId;
    }
}
