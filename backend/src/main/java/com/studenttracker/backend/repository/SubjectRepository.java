package com.studenttracker.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studenttracker.backend.model.Difficulty;
import com.studenttracker.backend.model.Subject;
import com.studenttracker.backend.model.User;

public interface SubjectRepository extends JpaRepository<Subject, Long>{

    List<Subject> findAllByUser(User user);

    Optional<Subject> findByNameAndUser(String name, User user);

    boolean existsByNameAndUser(String name, User user);

    List<Subject> findAllByUserAndDifficulty(User user, Difficulty difficulty);
    
}
