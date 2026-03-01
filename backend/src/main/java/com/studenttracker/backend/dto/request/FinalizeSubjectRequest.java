package com.studenttracker.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class FinalizeSubjectRequest {

    // Optional: 5–10. If null, grade is computed from totalPoints.
    @Min(value = 5, message = "Grade must be at least 5")
    @Max(value = 10, message = "Grade must be at most 10")
    private Integer manualGradeOverride;

    public Integer getManualGradeOverride() {
        return manualGradeOverride;
    }

    public void setManualGradeOverride(Integer manualGradeOverride) {
        this.manualGradeOverride = manualGradeOverride;
    }
}
