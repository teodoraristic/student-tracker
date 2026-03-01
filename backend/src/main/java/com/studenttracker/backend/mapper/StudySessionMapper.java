package com.studenttracker.backend.mapper;

import com.studenttracker.backend.dto.StudySessionDTO;
import com.studenttracker.backend.model.StudySession;
import com.studenttracker.backend.model.SubTask;
import com.studenttracker.backend.model.Task;

public class StudySessionMapper {

    public static StudySessionDTO toDTO(StudySession session) {
        StudySessionDTO dto = new StudySessionDTO();
        dto.setId(session.getId());
        dto.setDurationSeconds(session.getDurationSeconds());
        dto.setCompletedAt(session.getCompletedAt());
        dto.setNote(session.getNote());

        SubTask subtask = session.getSubtask();
        if (subtask != null) {
            dto.setSubtaskId(subtask.getId());
            dto.setSubtaskTitle(subtask.getTitle());
            Task task = subtask.getTask();
            dto.setTaskTitle(task.getTitle());
            dto.setSubjectName(task.getSubject().getName());
        }

        return dto;
    }
}
