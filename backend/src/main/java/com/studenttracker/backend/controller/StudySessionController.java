package com.studenttracker.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.studenttracker.backend.dto.StudySessionDTO;
import com.studenttracker.backend.dto.request.LogStudySessionRequest;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.service.AuthService;
import com.studenttracker.backend.service.StudySessionService;

@RestController
@RequestMapping("/api/study-sessions")
public class StudySessionController {

    private final StudySessionService studySessionService;
    private final AuthService authService;

    public StudySessionController(StudySessionService studySessionService, AuthService authService) {
        this.studySessionService = studySessionService;
        this.authService = authService;
    }

    @PostMapping
    public StudySessionDTO log(@RequestBody LogStudySessionRequest request) {
        User user = authService.getCurrentUser();
        return studySessionService.log(request, user);
    }

    @GetMapping("/today")
    public List<StudySessionDTO> getToday() {
        User user = authService.getCurrentUser();
        return studySessionService.getTodaySessions(user);
    }
}
