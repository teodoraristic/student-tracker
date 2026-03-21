package com.studenttracker.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.studenttracker.backend.dto.TaskDTO;
import com.studenttracker.backend.dto.request.CreateTaskRequest;
import com.studenttracker.backend.exception.ForbiddenException;
import com.studenttracker.backend.exception.NotFoundException;
import com.studenttracker.backend.mapper.TaskMapper;
import com.studenttracker.backend.model.Subject;
import com.studenttracker.backend.model.Task;
import com.studenttracker.backend.model.TaskStatus;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.repository.ExamPeriodRepository;
import com.studenttracker.backend.repository.SubjectRepository;
import com.studenttracker.backend.repository.TaskRepository;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final SubjectService subjectService;
    private final SubjectRepository subjectRepository;
    private final ExamPeriodRepository examPeriodRepository;

    public TaskService(TaskRepository taskRepository,
                       SubjectService subjectService,
                       SubjectRepository subjectRepository,
                       ExamPeriodRepository examPeriodRepository) {
        this.taskRepository = taskRepository;
        this.subjectService = subjectService;
        this.subjectRepository = subjectRepository;
        this.examPeriodRepository = examPeriodRepository;
    }

    public TaskDTO create(CreateTaskRequest request, User user) {

        Subject subject = subjectService.getByIdAndUser(
                request.getSubjectId(),
                user
        );

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setPoints(request.getPoints());
        task.setStatus(TaskStatus.TODO);
        task.setSubject(subject);
        if (request.getExamPeriodId() != null) {
            examPeriodRepository.findById(request.getExamPeriodId()).ifPresent(task::setExamPeriod);
        }

        return TaskMapper.toDTO(taskRepository.save(task));
    }


    public List<TaskDTO> getAllBySubject(Long subjectId) {

        Subject subject = subjectService.getById(subjectId);

        return taskRepository.findAllBySubject(subject)
                .stream()
                .map(TaskMapper::toDTO)
                .toList();
    }

    public Task getById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task not found"));
    }

    public List<TaskDTO> getAllByUser(User user) {
        List<Subject> subjects = subjectRepository.findAllByUser(user);
        return taskRepository.findAllBySubjectIn(subjects)
                .stream()
                .map(TaskMapper::toDTO)
                .toList();
    }

    public TaskDTO update(Long id, User user, CreateTaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task not found"));

        if (!task.getSubject().getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setPoints(request.getPoints());
        task.setEarnedPoints(request.getEarnedPoints());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getExamPeriodId() != null) {
            examPeriodRepository.findById(request.getExamPeriodId()).ifPresent(task::setExamPeriod);
        } else {
            task.setExamPeriod(null);
        }

        return TaskMapper.toDTO(taskRepository.save(task));
    }

    public TaskDTO updateStatus(Long id, User user, TaskStatus status, Integer earnedPoints) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task not found"));

        if (!task.getSubject().getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied");
        }

        task.setStatus(status);
        if (status == TaskStatus.DONE) {
            task.setEarnedPoints(earnedPoints);
        } else {
            task.setEarnedPoints(null);
        }
        return TaskMapper.toDTO(taskRepository.save(task));
    }

    public void delete(Long id, User user) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task not found"));

        if (!task.getSubject().getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied");
        }

        taskRepository.deleteById(id);
    }

}

