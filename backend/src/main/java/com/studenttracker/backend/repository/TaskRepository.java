package com.studenttracker.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studenttracker.backend.model.Subject;
import com.studenttracker.backend.model.Task;

public interface TaskRepository extends JpaRepository<Task, Long>{

    List<Task> findAllBySubject(Subject subject);

    List<Task> findAllBySubjectIn(List<Subject> subjects);
}
