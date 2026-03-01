package com.studenttracker.backend.mapper;

import com.studenttracker.backend.dto.SubTaskDTO;
import com.studenttracker.backend.model.SubTask;
import com.studenttracker.backend.model.Task;

public class SubTaskMapper {

    public static SubTaskDTO toDTO(SubTask subTask) {
        SubTaskDTO dto = new SubTaskDTO();
        dto.setId(subTask.getId());
        dto.setTitle(subTask.getTitle());
        dto.setDone(subTask.isDone());
        dto.setPlannedForDate(subTask.getPlannedForDate());
        return dto;
    }

    public static SubTaskDTO toEnrichedDTO(SubTask subTask) {
        SubTaskDTO dto = toDTO(subTask);
        Task task = subTask.getTask();
        dto.setTaskId(task.getId());
        dto.setTaskTitle(task.getTitle());
        dto.setTaskDueDate(task.getDueDate());
        dto.setSubjectId(task.getSubject().getId());
        dto.setSubjectName(task.getSubject().getName());
        return dto;
    }
}
