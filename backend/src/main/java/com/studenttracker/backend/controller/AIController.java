package com.studenttracker.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.studenttracker.backend.dto.BreakdownResponse;
import com.studenttracker.backend.dto.RiskItem;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.service.AIService;
import com.studenttracker.backend.service.AuthService;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;
    private final AuthService authService;

    public AIController(AIService aiService, AuthService authService) {
        this.aiService = aiService;
        this.authService = authService;
    }

    @PostMapping("/breakdown/{taskId}")
    public BreakdownResponse breakdown(
            @PathVariable Long taskId,
            @RequestBody(required = false) Map<String, String> body) {
        User user = authService.getCurrentUser();
        String extraDescription = body != null ? body.get("description") : null;
        return aiService.generateBreakdown(taskId, user, extraDescription);
    }

    @GetMapping("/risk")
    public List<RiskItem> riskAssessment() {
        User user = authService.getCurrentUser();
        return aiService.assessRisk(user);
    }
}
