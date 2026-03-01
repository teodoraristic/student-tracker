package com.studenttracker.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RiskItem {
    private Long taskId;
    private String title;
    private String subjectName;
    private String reason;
    private String riskLevel; // HIGH, MEDIUM, LOW
}
