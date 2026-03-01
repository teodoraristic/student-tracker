package com.studenttracker.backend.dto.request;

public class LogStudySessionRequest {

    private Long subtaskId; // optional
    private int durationSeconds;
    private String note;    // optional

    public LogStudySessionRequest() {}

    public Long getSubtaskId() { return subtaskId; }
    public void setSubtaskId(Long subtaskId) { this.subtaskId = subtaskId; }

    public int getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
