package com.studenttracker.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studenttracker.backend.model.SubTask;
import com.studenttracker.backend.model.Task;
import com.studenttracker.backend.model.User;

public interface SubTaskRepository extends JpaRepository<SubTask, Long> {

    List<SubTask> findAllByTask(Task task);

    List<SubTask> findAllByPlannedForDateAndTaskSubjectUser(LocalDate date, User user);

    List<SubTask> findAllByPlannedForDateIsNullAndDoneIsFalseAndTaskSubjectUser(User user);
}
