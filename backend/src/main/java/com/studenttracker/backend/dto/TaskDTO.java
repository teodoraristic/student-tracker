package com.studenttracker.backend.dto;

import java.time.LocalDate;
import java.util.List;

import com.studenttracker.backend.model.TaskStatus;

public class TaskDTO {

    private Long id;
    private String title;
    private String description;

    private TaskStatus status;

    private LocalDate dueDate;
    private Integer points;
    private Integer earnedPoints;

    private Long subjectId;

    private Long examPeriodId;
    private String examPeriodName;

    private List<SubTaskDTO> subTasks;

    public TaskDTO() {}

    public TaskDTO(
            Long id,
            String title,
            String description,
            TaskStatus status,
            LocalDate dueDate,
            Integer points,
            Integer earnedPoints,
            Long subjectId,
            List<SubTaskDTO> subTasks
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.dueDate = dueDate;
        this.points = points;
        this.earnedPoints = earnedPoints;
        this.subjectId = subjectId;
        this.subTasks = subTasks;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public Integer getEarnedPoints() { return earnedPoints; }
    public void setEarnedPoints(Integer earnedPoints) { this.earnedPoints = earnedPoints; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public Long getExamPeriodId() { return examPeriodId; }
    public void setExamPeriodId(Long examPeriodId) { this.examPeriodId = examPeriodId; }

    public String getExamPeriodName() { return examPeriodName; }
    public void setExamPeriodName(String examPeriodName) { this.examPeriodName = examPeriodName; }

    public List<SubTaskDTO> getSubTasks() { return subTasks; }
    public void setSubTasks(List<SubTaskDTO> subTasks) { this.subTasks = subTasks; }
}
