package com.studenttracker.backend.dto;

import java.time.LocalDateTime;

public class StudySessionDTO {

    private Long id;
    private int durationSeconds;
    private LocalDateTime completedAt;
    private String note;

    // Enriched fields – subtask/task/subject context
    private Long subtaskId;
    private String subtaskTitle;
    private String taskTitle;
    private String subjectName;

    public StudySessionDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Long getSubtaskId() { return subtaskId; }
    public void setSubtaskId(Long subtaskId) { this.subtaskId = subtaskId; }

    public String getSubtaskTitle() { return subtaskTitle; }
    public void setSubtaskTitle(String subtaskTitle) { this.subtaskTitle = subtaskTitle; }

    public String getTaskTitle() { return taskTitle; }
    public void setTaskTitle(String taskTitle) { this.taskTitle = taskTitle; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
}
