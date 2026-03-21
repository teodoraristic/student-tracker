package com.studenttracker.backend.mapper;

import com.studenttracker.backend.dto.ExamPeriodDTO;
import com.studenttracker.backend.model.ExamPeriod;

public class ExamPeriodMapper {

    public static ExamPeriodDTO toDTO(ExamPeriod ep) {
        ExamPeriodDTO dto = new ExamPeriodDTO();
        dto.setId(ep.getId());
        dto.setName(ep.getName());
        dto.setStartDate(ep.getStartDate());
        dto.setEndDate(ep.getEndDate());
        return dto;
    }
}
