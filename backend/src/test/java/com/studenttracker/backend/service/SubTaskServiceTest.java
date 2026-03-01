package com.studenttracker.backend.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.studenttracker.backend.dto.SubTaskDTO;
import com.studenttracker.backend.dto.request.CreateSubTaskRequest;
import com.studenttracker.backend.exception.ForbiddenException;
import com.studenttracker.backend.exception.NotFoundException;
import com.studenttracker.backend.model.SubTask;
import com.studenttracker.backend.model.Subject;
import com.studenttracker.backend.model.Task;
import com.studenttracker.backend.model.TaskStatus;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.repository.SubTaskRepository;

@ExtendWith(MockitoExtension.class)
class SubTaskServiceTest {

    @Mock
    private SubTaskRepository subTaskRepository;

    @Mock
    private TaskService taskService;

    @InjectMocks
    private SubTaskService subTaskService;

    // ── helpers ───────────────────────────────────────────────────────────────

    private User userWithId(Long id) {
        User u = new User();
        u.setId(id);
        return u;
    }

    private Task taskOwnedBy(User owner) {
        Subject subject = new Subject();
        subject.setUser(owner);

        Task task = new Task();
        task.setId(10L);
        task.setTitle("Lab Report");
        task.setStatus(TaskStatus.TODO);
        task.setSubject(subject);
        return task;
    }

    // ── create ────────────────────────────────────────────────────────────────

    @Test
    void create_success_returnsDTO() {
        User user = userWithId(1L);
        Task task = taskOwnedBy(user);

        CreateSubTaskRequest request = mock(CreateSubTaskRequest.class);
        when(request.getTaskId()).thenReturn(10L);
        when(request.getTitle()).thenReturn("Write introduction");
        when(request.getPlannedForDate()).thenReturn(LocalDate.of(2025, 6, 10));

        when(taskService.getById(10L)).thenReturn(task);
        when(subTaskRepository.save(any(SubTask.class))).thenAnswer(inv -> {
            SubTask st = inv.getArgument(0);
            st.setId(1L);
            return st;
        });

        SubTaskDTO dto = subTaskService.create(request, user);

        assertThat(dto.getTitle()).isEqualTo("Write introduction");
        assertThat(dto.isDone()).isFalse();
        verify(subTaskRepository).save(any(SubTask.class));
    }

    @Test
    void create_differentUser_throwsForbidden() {
        User owner = userWithId(1L);
        User requester = userWithId(2L);
        Task task = taskOwnedBy(owner);

        CreateSubTaskRequest request = mock(CreateSubTaskRequest.class);
        when(request.getTaskId()).thenReturn(10L);

        when(taskService.getById(10L)).thenReturn(task);

        assertThatThrownBy(() -> subTaskService.create(request, requester))
                .isInstanceOf(ForbiddenException.class)
                .hasMessage("Access denied");

        verify(subTaskRepository, never()).save(any());
    }

    // ── markDone ──────────────────────────────────────────────────────────────

    @Test
    void markDone_true_setsDoneFlag() {
        SubTask subTask = new SubTask();
        subTask.setId(5L);
        subTask.setTitle("Write tests");
        subTask.setDone(false);

        when(subTaskRepository.findById(5L)).thenReturn(Optional.of(subTask));
        when(subTaskRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SubTaskDTO dto = subTaskService.markDone(5L, true);

        assertThat(dto.isDone()).isTrue();
    }

    @Test
    void markDone_false_clearsDoneFlag() {
        SubTask subTask = new SubTask();
        subTask.setId(5L);
        subTask.setTitle("Write tests");
        subTask.setDone(true);

        when(subTaskRepository.findById(5L)).thenReturn(Optional.of(subTask));
        when(subTaskRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SubTaskDTO dto = subTaskService.markDone(5L, false);

        assertThat(dto.isDone()).isFalse();
    }

    @Test
    void markDone_notFound_throwsNotFoundException() {
        when(subTaskRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> subTaskService.markDone(999L, true))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("SubTask not found");
    }

    // ── updatePlan ────────────────────────────────────────────────────────────

    @Test
    void updatePlan_setsPlannedDate() {
        SubTask subTask = new SubTask();
        subTask.setId(5L);
        subTask.setTitle("Study chapter 3");

        LocalDate newDate = LocalDate.of(2025, 7, 1);

        when(subTaskRepository.findById(5L)).thenReturn(Optional.of(subTask));
        when(subTaskRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SubTaskDTO dto = subTaskService.updatePlan(5L, newDate);

        assertThat(dto.getPlannedForDate()).isEqualTo(newDate);
    }
}
