package com.studenttracker.backend.dto.request;

import com.studenttracker.backend.model.SemesterType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class CreateSemesterRequest {

    @NotBlank(message = "Semester name is required")
    private String name;

    @NotNull(message = "Semester type is required")
    private SemesterType type;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    private LocalDate startDate;

    private LocalDate endDate;

    public CreateSemesterRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public SemesterType getType() { return type; }
    public void setType(SemesterType type) { this.type = type; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
