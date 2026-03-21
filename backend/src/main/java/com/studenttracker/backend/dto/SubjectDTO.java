package com.studenttracker.backend.dto;

import com.studenttracker.backend.model.SubjectStatus;
import java.time.LocalDate;

public class SubjectDTO {

    private Long id;
    private String name;
    private String website;
    private String color;
    private int totalTasks;
    private int completedTasks;
    private SubjectStatus status;
    private Integer finalGrade;
    private Integer manualGradeOverride;
    private LocalDate passedAt;
    private int totalPoints;
    private Long semesterId;
    private String semesterName;

    public SubjectDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public int getTotalTasks() { return totalTasks; }
    public void setTotalTasks(int totalTasks) { this.totalTasks = totalTasks; }

    public int getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(int completedTasks) { this.completedTasks = completedTasks; }

    public SubjectStatus getStatus() { return status; }
    public void setStatus(SubjectStatus status) { this.status = status; }

    public Integer getFinalGrade() { return finalGrade; }
    public void setFinalGrade(Integer finalGrade) { this.finalGrade = finalGrade; }

    public Integer getManualGradeOverride() { return manualGradeOverride; }
    public void setManualGradeOverride(Integer manualGradeOverride) { this.manualGradeOverride = manualGradeOverride; }

    public LocalDate getPassedAt() { return passedAt; }
    public void setPassedAt(LocalDate passedAt) { this.passedAt = passedAt; }

    public int getTotalPoints() { return totalPoints; }
    public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }

    public Long getSemesterId() { return semesterId; }
    public void setSemesterId(Long semesterId) { this.semesterId = semesterId; }

    public String getSemesterName() { return semesterName; }
    public void setSemesterName(String semesterName) { this.semesterName = semesterName; }
}
