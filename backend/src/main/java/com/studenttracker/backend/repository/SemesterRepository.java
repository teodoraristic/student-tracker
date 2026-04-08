package com.studenttracker.backend.repository;

import com.studenttracker.backend.model.Semester;
import com.studenttracker.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SemesterRepository extends JpaRepository<Semester, Long> {
    List<Semester> findAllByUser(User user);

    void deleteAllByUser(User user);
}
