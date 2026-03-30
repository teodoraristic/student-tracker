package com.studenttracker.backend.service;

import java.time.LocalDate;
import java.util.List;

import com.studenttracker.backend.model.Subject;

import org.springframework.stereotype.Service;

import com.studenttracker.backend.dto.SubTaskDTO;
import com.studenttracker.backend.dto.request.CreateSubTaskRequest;
import com.studenttracker.backend.exception.ForbiddenException;
import com.studenttracker.backend.exception.NotFoundException;
import com.studenttracker.backend.mapper.SubTaskMapper;
import com.studenttracker.backend.model.SubTask;
import com.studenttracker.backend.model.Task;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.repository.SubTaskRepository;

@Service
public class SubTaskService {

    private final SubTaskRepository subTaskRepository;
    private final TaskService taskService;

    public SubTaskService(SubTaskRepository subTaskRepository,
                          TaskService taskService) {
        this.subTaskRepository = subTaskRepository;
        this.taskService = taskService;
    }

    public SubTaskDTO create(CreateSubTaskRequest request, User user) {

        Task task = taskService.getById(request.getTaskId());

        Subject subject = task.getSubject();

        if (!subject.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied");
        }

        SubTask subTask = new SubTask();
        subTask.setTitle(request.getTitle());
        subTask.setDone(false);
        subTask.setTask(task);
        subTask.setPlannedForDate(request.getPlannedForDate());

        return SubTaskMapper.toDTO(
                subTaskRepository.save(subTask)
        );
    }

    public List<SubTaskDTO> getAllByTask(Long taskId, User user) {

        Task task = taskService.getById(taskId);

        if (!task.getSubject().getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied");
        }

        return subTaskRepository.findAllByTask(task)
                .stream()
                .map(SubTaskMapper::toDTO)
                .toList();
    }

    public List<SubTaskDTO> getByDate(LocalDate date, User user) {
        return subTaskRepository
                .findAllByPlannedForDateAndTaskSubjectUser(date, user)
                .stream()
                .map(SubTaskMapper::toEnrichedDTO)
                .toList();
    }

    public SubTaskDTO markDone(Long subTaskId, boolean done, User user) {

        SubTask subTask = subTaskRepository.findById(subTaskId)
                .orElseThrow(() -> new NotFoundException("SubTask not found"));

        if (!subTask.getTask().getSubject().getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied");
        }

        subTask.setDone(done);

        return SubTaskMapper.toDTO(
                subTaskRepository.save(subTask)
        );
    }

    public SubTaskDTO updatePlan(Long id, LocalDate plannedForDate, User user) {

        SubTask subTask = subTaskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("SubTask not found"));

        if (!subTask.getTask().getSubject().getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied");
        }

        subTask.setPlannedForDate(plannedForDate);

        return SubTaskMapper.toDTO(subTaskRepository.save(subTask));
    }

    public List<SubTaskDTO> getUnplanned(User user) {
        return subTaskRepository
                .findAllByPlannedForDateIsNullAndDoneIsFalseAndTaskSubjectUser(user)
                .stream()
                .map(SubTaskMapper::toEnrichedDTO)
                .toList();
    }

    public void delete(Long id, User user) {
        SubTask subTask = subTaskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("SubTask not found"));

        if (!subTask.getTask().getSubject().getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied");
        }

        subTaskRepository.deleteById(id);
    }
}
