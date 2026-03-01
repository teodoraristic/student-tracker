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

        return new TaskDTO(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getPriority(),
                task.getStatus(),
                task.getDueDate(),
                task.getPoints(),
                task.getEarnedPoints(),
                task.getSubject().getId(),
                subTaskDTOs
        );
    }
}
