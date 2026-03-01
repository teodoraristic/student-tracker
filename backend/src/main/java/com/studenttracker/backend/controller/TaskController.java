package com.studenttracker.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import com.studenttracker.backend.dto.TaskDTO;
import com.studenttracker.backend.dto.request.CreateTaskRequest;
import com.studenttracker.backend.exception.ForbiddenException;
import com.studenttracker.backend.mapper.TaskMapper;
import com.studenttracker.backend.model.Task;
import com.studenttracker.backend.model.TaskStatus;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.service.AuthService;
import com.studenttracker.backend.service.TaskService;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final AuthService authService;

    public TaskController(TaskService taskService, AuthService authService) {
        this.taskService = taskService;
        this.authService = authService;
    }

    // CREATE TASK
    @PostMapping
    public TaskDTO createTask(@Valid @RequestBody CreateTaskRequest request) {
        User user = authService.getCurrentUser();
        return taskService.create(request, user);
    }

    // GET ALL TASKS FOR CURRENT USER
    @GetMapping
    public List<TaskDTO> getAllTasks() {
        User user = authService.getCurrentUser();
        return taskService.getAllByUser(user);
    }

    // GET TASK BY ID
    @GetMapping("/{id}")
    public TaskDTO getTaskById(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        Task task = taskService.getById(id);
        if (!task.getSubject().getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied");
        }
        return TaskMapper.toDTO(task);
    }

    // GET TASKS BY SUBJECT
    @GetMapping("/subject/{subjectId}")
    public List<TaskDTO> getTasksBySubject(@PathVariable Long subjectId) {
        return taskService.getAllBySubject(subjectId);
    }

    // UPDATE TASK
    @PutMapping("/{id}")
    public TaskDTO updateTask(@PathVariable Long id, @Valid @RequestBody CreateTaskRequest request) {
        User user = authService.getCurrentUser();
        return taskService.update(id, user, request);
    }

    // DELETE TASK
    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        taskService.delete(id, user);
    }

    // UPDATE TASK STATUS
    @PatchMapping("/{id}/status")
    public TaskDTO updateTaskStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User user = authService.getCurrentUser();
        TaskStatus status = TaskStatus.valueOf((String) body.get("status"));
        Integer earnedPoints = body.get("earnedPoints") != null
                ? ((Number) body.get("earnedPoints")).intValue()
                : null;
        return taskService.updateStatus(id, user, status, earnedPoints);
    }
}
