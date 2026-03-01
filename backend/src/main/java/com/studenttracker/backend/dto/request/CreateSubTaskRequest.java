package com.studenttracker.backend.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateSubTaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Task is required")
    private Long taskId;

    private LocalDate plannedForDate;

    public CreateSubTaskRequest() {}

    public String getTitle() {
        return title;
    }

    public Long getTaskId() {
        return taskId;
    }

    public LocalDate getPlannedForDate() {
        return plannedForDate;
    }
}
