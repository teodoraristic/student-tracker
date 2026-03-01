package com.studenttracker.backend.dto;

import java.time.LocalDate;

public class SubTaskDTO {

    private Long id;
    private String title;
    private boolean done;
    private LocalDate plannedForDate;

    // Enriched fields – populated only by the /planned endpoint
    private Long taskId;
    private String taskTitle;
    private LocalDate taskDueDate;
    private Long subjectId;
    private String subjectName;

    public SubTaskDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public boolean isDone() { return done; }
    public void setDone(boolean done) { this.done = done; }

    public LocalDate getPlannedForDate() { return plannedForDate; }
    public void setPlannedForDate(LocalDate plannedForDate) { this.plannedForDate = plannedForDate; }

    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }

    public String getTaskTitle() { return taskTitle; }
    public void setTaskTitle(String taskTitle) { this.taskTitle = taskTitle; }

    public LocalDate getTaskDueDate() { return taskDueDate; }
    public void setTaskDueDate(LocalDate taskDueDate) { this.taskDueDate = taskDueDate; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
}
