package com.studenttracker.backend.dto.request;

import java.time.LocalDate;

import com.studenttracker.backend.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateTaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private TaskStatus status;
    private LocalDate dueDate;
    private Integer points;
    private Integer earnedPoints;

    @NotNull(message = "Subject is required")
    private Long subjectId;

    private Long examPeriodId;

    public CreateTaskRequest() {}

    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDate getDueDate() { return dueDate; }
    public Integer getPoints() { return points; }
    public Integer getEarnedPoints() { return earnedPoints; }
    public Long getSubjectId() { return subjectId; }
    public TaskStatus getStatus() { return status; }
    public Long getExamPeriodId() { return examPeriodId; }
}
