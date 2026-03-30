package com.studenttracker.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import com.studenttracker.backend.dto.SubTaskDTO;
import com.studenttracker.backend.dto.request.CreateSubTaskRequest;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.service.AuthService;
import com.studenttracker.backend.service.SubTaskService;

@RestController
@RequestMapping("/api/subtasks")
public class SubTaskController {

    private final SubTaskService subTaskService;
    private final AuthService authService;

    public SubTaskController(SubTaskService subTaskService, AuthService authService) {
        this.subTaskService = subTaskService;
        this.authService = authService;
    }

    @PostMapping
    public SubTaskDTO create(@Valid @RequestBody CreateSubTaskRequest request) {
        User user = authService.getCurrentUser();
        return subTaskService.create(request, user);
    }

    @GetMapping("/task/{taskId}")
    public List<SubTaskDTO> getAllByTask(@PathVariable Long taskId) {
        User user = authService.getCurrentUser();
        return subTaskService.getAllByTask(taskId, user);
    }

    // GET /api/subtasks/unplanned
    @GetMapping("/unplanned")
    public List<SubTaskDTO> getUnplanned() {
        User user = authService.getCurrentUser();
        return subTaskService.getUnplanned(user);
    }

    // GET /api/subtasks/planned?date=2026-02-27
    @GetMapping("/planned")
    public List<SubTaskDTO> getPlanned(@RequestParam String date) {
        User user = authService.getCurrentUser();
        LocalDate localDate = LocalDate.parse(date);
        return subTaskService.getByDate(localDate, user);
    }

    @PutMapping("/{id}/done")
    public SubTaskDTO markDone(
            @PathVariable Long id,
            @RequestParam boolean done) {

        User user = authService.getCurrentUser();
        return subTaskService.markDone(id, done, user);
    }

    // PATCH /api/subtasks/{id}/plan
    // Body: { "plannedForDate": "2026-02-27" } or { "plannedForDate": null }
    @PatchMapping("/{id}/plan")
    public SubTaskDTO updatePlan(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        User user = authService.getCurrentUser();
        String dateStr = (String) body.get("plannedForDate");
        LocalDate plannedForDate = dateStr != null ? LocalDate.parse(dateStr) : null;
        return subTaskService.updatePlan(id, plannedForDate, user);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        subTaskService.delete(id, user);
    }
}
