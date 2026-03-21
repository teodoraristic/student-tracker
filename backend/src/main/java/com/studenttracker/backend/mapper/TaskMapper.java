package com.studenttracker.backend.mapper;

import java.util.List;

import com.studenttracker.backend.dto.SubTaskDTO;
import com.studenttracker.backend.dto.TaskDTO;
import com.studenttracker.backend.model.Task;

public class TaskMapper {

    public static TaskDTO toDTO(Task task) {

        List<SubTaskDTO> subTaskDTOs = task.getSubTasks() != null
                ? task.getSubTasks().stream()
                    .map(SubTaskMapper::toDTO)
                    .toList()
                : List.of();

        TaskDTO dto = new TaskDTO(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getDueDate(),
                task.getPoints(),
                task.getEarnedPoints(),
                task.getSubject().getId(),
                subTaskDTOs
        );
        if (task.getExamPeriod() != null) {
            dto.setExamPeriodId(task.getExamPeriod().getId());
            dto.setExamPeriodName(task.getExamPeriod().getName());
        }
        return dto;
    }
}
