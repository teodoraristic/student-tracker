package com.studenttracker.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import com.studenttracker.backend.dto.SubjectDTO;
import com.studenttracker.backend.dto.request.CreateSubjectRequest;
import com.studenttracker.backend.dto.request.FinalizeSubjectRequest;
import com.studenttracker.backend.mapper.SubjectMapper;
import com.studenttracker.backend.model.Difficulty;
import com.studenttracker.backend.model.Subject;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.service.AuthService;
import com.studenttracker.backend.service.SubjectService;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService subjectService;
    private final AuthService authService;

    public SubjectController(SubjectService subjectService, AuthService authService) {
        this.subjectService = subjectService;
        this.authService = authService;
    }

    @PostMapping
    public SubjectDTO create(@Valid @RequestBody CreateSubjectRequest request) {
        User user = authService.getCurrentUser();
        return subjectService.create(request, user);
    }

    @GetMapping
    public List<SubjectDTO> getMySubjects() {
        User user = authService.getCurrentUser();
        return subjectService.getAllByUser(user);
    }

    @GetMapping("/{id}")
    public SubjectDTO getById(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        Subject subject = subjectService.getByIdAndUser(id, user);
        return SubjectMapper.toDTO(subject);
    }

    @GetMapping("/name/{name}")
    public SubjectDTO getByName(@PathVariable String name) {
        User user = authService.getCurrentUser();
        return subjectService.getByNameAndUser(name, user);
    }

    @GetMapping("/difficulty/{difficulty}")
    public List<SubjectDTO> getByDifficulty(@PathVariable Difficulty difficulty) {
        User user = authService.getCurrentUser();
        return subjectService.getAllByUserAndDifficulty(user, difficulty);
    }

    @PutMapping("/{id}")
    public SubjectDTO update(@PathVariable Long id, @Valid @RequestBody CreateSubjectRequest request) {
        User user = authService.getCurrentUser();
        return subjectService.update(id, user, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        subjectService.delete(id, user);
    }

    @PatchMapping("/{id}/finalize")
    public SubjectDTO finalizeGrade(@PathVariable Long id, @Valid @RequestBody FinalizeSubjectRequest request) {
        User user = authService.getCurrentUser();
        return subjectService.finalizeSubject(id, user, request);
    }

    @PatchMapping("/{id}/reset")
    public SubjectDTO reset(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        return subjectService.resetSubjectStatus(id, user);
    }
}
