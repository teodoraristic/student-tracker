package com.studenttracker.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studenttracker.backend.model.StudySession;
import com.studenttracker.backend.model.User;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    List<StudySession> findAllByUserAndCompletedAtBetweenOrderByCompletedAtDesc(
            User user, LocalDateTime from, LocalDateTime to);

    void deleteByUser(User user);
}
