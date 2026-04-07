package com.studenttracker.backend.repository;

import com.studenttracker.backend.model.ExamPeriod;
import com.studenttracker.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamPeriodRepository extends JpaRepository<ExamPeriod, Long> {
    List<ExamPeriod> findAllByUser(User user);

    void deleteAllByUser(User user);
}
