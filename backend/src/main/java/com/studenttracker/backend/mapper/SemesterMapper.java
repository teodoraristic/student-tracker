package com.studenttracker.backend.mapper;

import com.studenttracker.backend.dto.SemesterDTO;
import com.studenttracker.backend.model.Semester;

public class SemesterMapper {

    public static SemesterDTO toDTO(Semester s) {
        SemesterDTO dto = new SemesterDTO();
        dto.setId(s.getId());
        dto.setName(s.getName());
        dto.setType(s.getType());
        dto.setAcademicYear(s.getAcademicYear());
        dto.setStartDate(s.getStartDate());
        dto.setEndDate(s.getEndDate());
        return dto;
    }
}
