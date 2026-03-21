package com.studenttracker.backend.controller;

import com.studenttracker.backend.dto.SemesterDTO;
import com.studenttracker.backend.dto.request.CreateSemesterRequest;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.service.AuthService;
import com.studenttracker.backend.service.SemesterService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/semesters")
public class SemesterController {

    private final SemesterService semesterService;
    private final AuthService authService;

    public SemesterController(SemesterService semesterService, AuthService authService) {
        this.semesterService = semesterService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<SemesterDTO>> getAll() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(semesterService.getAllByUser(user));
    }

    @PostMapping
    public ResponseEntity<SemesterDTO> create(@Valid @RequestBody CreateSemesterRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(semesterService.create(request, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SemesterDTO> update(@PathVariable Long id, @Valid @RequestBody CreateSemesterRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(semesterService.update(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        semesterService.delete(id, user);
        return ResponseEntity.noContent().build();
    }
}
