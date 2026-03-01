package com.studenttracker.backend.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.studenttracker.backend.dto.TaskDTO;
import com.studenttracker.backend.dto.request.CreateTaskRequest;
import com.studenttracker.backend.exception.ForbiddenException;
import com.studenttracker.backend.exception.NotFoundException;
import com.studenttracker.backend.model.Priority;
import com.studenttracker.backend.model.Subject;
import com.studenttracker.backend.model.Task;
import com.studenttracker.backend.model.TaskStatus;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.repository.SubjectRepository;
import com.studenttracker.backend.repository.TaskRepository;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private SubjectService subjectService;

    @Mock
    private SubjectRepository subjectRepository;

    @InjectMocks
    private TaskService taskService;

    // ── helpers ───────────────────────────────────────────────────────────────

    private User userWithId(Long id) {
        User u = new User();
        u.setId(id);
        return u;
    }

    private Task taskOwnedBy(User owner) {
        Subject subject = new Subject();
        subject.setId(1L);
        subject.setUser(owner);

        Task task = new Task();
        task.setId(100L);
        task.setTitle("Homework");
        task.setStatus(TaskStatus.TODO);
        task.setSubject(subject);
        task.setSubTasks(List.of());
        return task;
    }

    // ── create ────────────────────────────────────────────────────────────────

    @Test
    void create_success_returnsDTO() {
        User user = userWithId(1L);
        Subject subject = new Subject();
        subject.setId(5L);
        subject.setUser(user);

        CreateTaskRequest request = mock(CreateTaskRequest.class);
        when(request.getSubjectId()).thenReturn(5L);
        when(request.getTitle()).thenReturn("Lab Report");
        when(request.getPriority()).thenReturn(Priority.HIGH);

        when(subjectService.getByIdAndUser(5L, user)).thenReturn(subject);
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> {
            Task t = inv.getArgument(0);
            t.setId(1L);
            t.setSubTasks(List.of());
            return t;
        });

        TaskDTO dto = taskService.create(request, user);

        assertThat(dto.getTitle()).isEqualTo("Lab Report");
        assertThat(dto.getStatus()).isEqualTo(TaskStatus.TODO);
        verify(taskRepository).save(any(Task.class));
    }

    // ── updateStatus ──────────────────────────────────────────────────────────

    @Test
    void updateStatus_toDone_setsEarnedPoints() {
        User user = userWithId(1L);
        Task task = taskOwnedBy(user);

        when(taskRepository.findById(100L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TaskDTO dto = taskService.updateStatus(100L, user, TaskStatus.DONE, 85);

        assertThat(dto.getStatus()).isEqualTo(TaskStatus.DONE);
        assertThat(dto.getEarnedPoints()).isEqualTo(85);
    }

    @Test
    void updateStatus_toTodo_clearsEarnedPoints() {
        User user = userWithId(1L);
        Task task = taskOwnedBy(user);
        task.setStatus(TaskStatus.DONE);
        task.setEarnedPoints(85);

        when(taskRepository.findById(100L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TaskDTO dto = taskService.updateStatus(100L, user, TaskStatus.TODO, null);

        assertThat(dto.getStatus()).isEqualTo(TaskStatus.TODO);
        assertThat(dto.getEarnedPoints()).isNull();
    }

    @Test
    void updateStatus_taskNotFound_throwsNotFound() {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.updateStatus(999L, userWithId(1L), TaskStatus.DONE, 90))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Task not found");
    }

    @Test
    void updateStatus_differentUser_throwsForbidden() {
        User owner = userWithId(1L);
        User requester = userWithId(2L);
        Task task = taskOwnedBy(owner);

        when(taskRepository.findById(100L)).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> taskService.updateStatus(100L, requester, TaskStatus.DONE, 90))
                .isInstanceOf(ForbiddenException.class)
                .hasMessage("Access denied");
    }

    // ── delete ────────────────────────────────────────────────────────────────

    @Test
    void delete_success_callsRepository() {
        User user = userWithId(1L);
        Task task = taskOwnedBy(user);

        when(taskRepository.findById(100L)).thenReturn(Optional.of(task));

        taskService.delete(100L, user);

        verify(taskRepository).deleteById(100L);
    }

    @Test
    void delete_differentUser_throwsForbidden() {
        User owner = userWithId(1L);
        User requester = userWithId(2L);
        Task task = taskOwnedBy(owner);

        when(taskRepository.findById(100L)).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> taskService.delete(100L, requester))
                .isInstanceOf(ForbiddenException.class)
                .hasMessage("Access denied");

        verify(taskRepository, never()).deleteById(any());
    }
}
