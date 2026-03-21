package com.studenttracker.backend.mapper;

import com.studenttracker.backend.dto.SubjectDTO;
import com.studenttracker.backend.model.Subject;
import com.studenttracker.backend.model.SubjectStatus;
import com.studenttracker.backend.model.Task;

public class SubjectMapper {

    public static SubjectDTO toDTO(Subject subject) {

        int totalTasks = subject.getTasks() != null ? subject.getTasks().size() : 0;

        int completedTasks = subject.getTasks() != null
                ? (int) subject.getTasks().stream()
                        .filter(t -> t.getStatus().isDone())
                        .count()
                : 0;

        int totalPoints = subject.getTasks() != null
                ? subject.getTasks().stream()
                        .filter(t -> t.getStatus().isDone() && t.getPoints() != null)
                        .mapToInt(Task::getPoints)
                        .sum()
                : 0;

        SubjectDTO dto = new SubjectDTO();
        dto.setId(subject.getId());
        dto.setName(subject.getName());
        dto.setWebsite(subject.getWebsite());
        dto.setColor(subject.getColor());
        dto.setTotalTasks(totalTasks);
        dto.setCompletedTasks(completedTasks);
        dto.setTotalPoints(totalPoints);
        dto.setStatus(subject.getStatus() != null ? subject.getStatus() : SubjectStatus.IN_PROGRESS);
        dto.setFinalGrade(subject.getFinalGrade());
        dto.setManualGradeOverride(subject.getManualGradeOverride());
        dto.setPassedAt(subject.getPassedAt());
        dto.setSemesterId(subject.getSemester() != null ? subject.getSemester().getId() : null);
        dto.setSemesterName(subject.getSemester() != null ? subject.getSemester().getName() : null);
        return dto;
    }
}
