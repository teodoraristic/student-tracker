package com.studenttracker.backend.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studenttracker.backend.dto.BreakdownResponse;
import com.studenttracker.backend.dto.RiskItem;
import com.studenttracker.backend.dto.SubjectDTO;
import com.studenttracker.backend.dto.TaskDTO;
import com.studenttracker.backend.exception.ForbiddenException;
import com.studenttracker.backend.model.Task;
import com.studenttracker.backend.model.TaskStatus;
import com.studenttracker.backend.model.User;

@Service
public class AIService {

    @Value("${claude.api.key}")
    private String apiKey;

    private final TaskService taskService;
    private final SubjectService subjectService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AIService(TaskService taskService, SubjectService subjectService) {
        this.taskService = taskService;
        this.subjectService = subjectService;
    }

    public BreakdownResponse generateBreakdown(Long taskId, User user, String extraDescription) {
        Task task = taskService.getById(taskId);

        if (!task.getSubject().getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied");
        }

        try {
            String text = stripMarkdown(callClaude(buildBreakdownPrompt(task, extraDescription)));
            JsonNode arr = objectMapper.readTree(text);
            List<String> subtasks = new ArrayList<>();
            if (arr.isArray()) {
                arr.forEach(node -> subtasks.add(node.asText()));
            }
            return new BreakdownResponse(subtasks);
        } catch (Exception e) {
            return new BreakdownResponse(List.of());
        }
    }

    public List<RiskItem> assessRisk(User user) {
        List<TaskDTO> tasks = taskService.getAllByUser(user);
        List<SubjectDTO> subjects = subjectService.getAllByUser(user);

        Map<Long, String> subjectNames = subjects.stream()
                .collect(Collectors.toMap(SubjectDTO::getId, SubjectDTO::getName));

        List<TaskDTO> todoTasks = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.TODO)
                .collect(Collectors.toList());

        if (todoTasks.isEmpty()) return List.of();

        try {
            String text = stripMarkdown(callClaude(buildRiskPrompt(todoTasks, subjectNames)));
            JsonNode arr = objectMapper.readTree(text);
            List<RiskItem> result = new ArrayList<>();
            if (arr.isArray()) {
                for (JsonNode item : arr) {
                    RiskItem ri = new RiskItem();
                    ri.setTaskId(item.path("taskId").asLong());
                    ri.setReason(item.path("reason").asText());
                    ri.setRiskLevel(item.path("riskLevel").asText());
                    todoTasks.stream()
                            .filter(t -> t.getId().equals(ri.getTaskId()))
                            .findFirst()
                            .ifPresent(t -> {
                                ri.setTitle(t.getTitle());
                                ri.setSubjectName(subjectNames.getOrDefault(t.getSubjectId(), ""));
                            });
                    result.add(ri);
                }
            }
            return result;
        } catch (Exception e) {
            return List.of();
        }
    }

    private String callClaude(String prompt) throws Exception {
        Map<String, Object> body = Map.of(
                "model", "claude-haiku-4-5-20251001",
                "max_tokens", 1024,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        String bodyJson = objectMapper.writeValueAsString(body);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.anthropic.com/v1/messages"))
                .header("content-type", "application/json")
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        JsonNode root = objectMapper.readTree(response.body());
        return root.path("content").get(0).path("text").asText();
    }

    private String stripMarkdown(String text) {
        text = text.strip();
        if (text.startsWith("```")) {
            text = text.replaceAll("(?s)^```[a-z]*\\n?", "").replaceAll("```\\s*$", "").strip();
        }
        return text;
    }

    private String buildBreakdownPrompt(Task task, String extraDescription) {
        String description = (task.getDescription() != null && !task.getDescription().isBlank())
                ? task.getDescription()
                : (extraDescription != null && !extraDescription.isBlank() ? extraDescription : "No description provided");
        return String.format("""
                You are a student study assistant.
                Break down this university assignment into 4-7 specific, actionable subtasks a student should complete.

                Assignment:
                Title: %s
                Subject: %s
                Description: %s
                Due: %s

                Return ONLY a JSON array of short subtask titles (strings), nothing else.
                Example: ["Read the assignment brief", "Research topic", "Write outline"]
                """,
                task.getTitle(),
                task.getSubject().getName(),
                description,
                task.getDueDate() != null ? task.getDueDate().toString() : "No due date"
        );
    }

    private String buildRiskPrompt(List<TaskDTO> tasks, Map<Long, String> subjectNames) {
        StringBuilder sb = new StringBuilder();
        sb.append("Today is ").append(LocalDate.now()).append(".\n");
        sb.append("Analyze these incomplete university assignments and identify up to 4 that are most at risk:\n\n");

        for (TaskDTO t : tasks) {
            sb.append(String.format("- ID: %d, Title: \"%s\", Subject: \"%s\", Due: %s, Priority: %s%n",
                    t.getId(),
                    t.getTitle(),
                    subjectNames.getOrDefault(t.getSubjectId(), "Unknown"),
                    t.getDueDate() != null ? t.getDueDate().toString() : "no deadline"
            ));
        }

        sb.append("""

                Return ONLY a JSON array (no explanation). Example:
                [{"taskId": 1, "reason": "Due in 2 days and not started", "riskLevel": "HIGH"}]
                Risk levels: HIGH (overdue or due within 7 days), MEDIUM (due within 30 days or HIGH priority).
                Only include assignments that are genuinely at risk. Return [] if none are at risk.
                """);

        return sb.toString();
    }
}
