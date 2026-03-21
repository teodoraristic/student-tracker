package com.studenttracker.backend.controller;

import com.studenttracker.backend.dto.ExamPeriodDTO;
import com.studenttracker.backend.dto.request.CreateExamPeriodRequest;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.service.AuthService;
import com.studenttracker.backend.service.ExamPeriodService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exam-periods")
public class ExamPeriodController {

    private final ExamPeriodService examPeriodService;
    private final AuthService authService;

    public ExamPeriodController(ExamPeriodService examPeriodService, AuthService authService) {
        this.examPeriodService = examPeriodService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<ExamPeriodDTO>> getAll() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(examPeriodService.getAllByUser(user));
    }

    @PostMapping
    public ResponseEntity<ExamPeriodDTO> create(@Valid @RequestBody CreateExamPeriodRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(examPeriodService.create(request, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExamPeriodDTO> update(@PathVariable Long id, @Valid @RequestBody CreateExamPeriodRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(examPeriodService.update(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        examPeriodService.delete(id, user);
        return ResponseEntity.noContent().build();
    }
}
