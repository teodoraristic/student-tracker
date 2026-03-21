package com.studenttracker.backend.dto;

import com.studenttracker.backend.model.SemesterType;
import java.time.LocalDate;

public class SemesterDTO {

    private Long id;
    private String name;
    private SemesterType type;
    private String academicYear;
    private LocalDate startDate;
    private LocalDate endDate;

    public SemesterDTO() {}

    public SemesterDTO(Long id, String name, SemesterType type, String academicYear, LocalDate startDate, LocalDate endDate) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.academicYear = academicYear;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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
