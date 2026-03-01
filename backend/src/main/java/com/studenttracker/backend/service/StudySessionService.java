package com.studenttracker.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.studenttracker.backend.dto.StudySessionDTO;
import com.studenttracker.backend.dto.request.LogStudySessionRequest;
import com.studenttracker.backend.exception.NotFoundException;
import com.studenttracker.backend.mapper.StudySessionMapper;
import com.studenttracker.backend.model.StudySession;
import com.studenttracker.backend.model.SubTask;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.repository.StudySessionRepository;
import com.studenttracker.backend.repository.SubTaskRepository;

@Service
public class StudySessionService {

    private final StudySessionRepository studySessionRepository;
    private final SubTaskRepository subTaskRepository;

    public StudySessionService(StudySessionRepository studySessionRepository,
                               SubTaskRepository subTaskRepository) {
        this.studySessionRepository = studySessionRepository;
        this.subTaskRepository = subTaskRepository;
    }

    public StudySessionDTO log(LogStudySessionRequest request, User user) {
        StudySession session = new StudySession();
        session.setUser(user);
        session.setDurationSeconds(request.getDurationSeconds());
        session.setCompletedAt(LocalDateTime.now());
        session.setNote(request.getNote());

        if (request.getSubtaskId() != null) {
            SubTask subtask = subTaskRepository.findById(request.getSubtaskId())
                    .orElseThrow(() -> new NotFoundException("SubTask not found"));
            session.setSubtask(subtask);
        }

        return StudySessionMapper.toDTO(studySessionRepository.save(session));
    }

    public List<StudySessionDTO> getTodaySessions(User user) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        return studySessionRepository
                .findAllByUserAndCompletedAtBetweenOrderByCompletedAtDesc(user, start, end)
                .stream()
                .map(StudySessionMapper::toDTO)
                .toList();
    }
}
