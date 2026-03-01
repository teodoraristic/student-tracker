package com.studenttracker.backend.dto.request;

import com.studenttracker.backend.model.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateSubjectRequest {

    @NotBlank(message = "Subject name is required")
    private String name;

    private String website;

    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;

    public CreateSubjectRequest() {}

    public String getName() {
        return name;
    }

    public String getWebsite() {
        return website;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }
}
