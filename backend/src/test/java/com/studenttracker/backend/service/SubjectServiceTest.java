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

import com.studenttracker.backend.dto.SubjectDTO;
import com.studenttracker.backend.dto.request.CreateSubjectRequest;
import com.studenttracker.backend.dto.request.FinalizeSubjectRequest;
import com.studenttracker.backend.exception.ConflictException;
import com.studenttracker.backend.exception.ForbiddenException;
import com.studenttracker.backend.exception.NotFoundException;
import com.studenttracker.backend.model.Subject;
import com.studenttracker.backend.model.SubjectStatus;
import com.studenttracker.backend.model.Task;
import com.studenttracker.backend.model.TaskStatus;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.repository.SubjectRepository;

@ExtendWith(MockitoExtension.class)
class SubjectServiceTest {

    @Mock
    private SubjectRepository subjectRepository;

    @InjectMocks
    private SubjectService subjectService;

    // ── helpers ───────────────────────────────────────────────────────────────

    private User userWithId(Long id) {
        User u = new User();
        u.setId(id);
        return u;
    }

    private Task doneTaskWithPoints(int points) {
        Task t = new Task();
        t.setStatus(TaskStatus.DONE);
        t.setPoints(points);
        return t;
    }

    // ── create ────────────────────────────────────────────────────────────────

    @Test
    void create_success_returnsDTO() {
        User user = userWithId(1L);

        CreateSubjectRequest request = mock(CreateSubjectRequest.class);
        when(request.getName()).thenReturn("Mathematics");

        when(subjectRepository.existsByNameAndUser("Mathematics", user)).thenReturn(false);
        when(subjectRepository.save(any(Subject.class))).thenAnswer(inv -> {
            Subject s = inv.getArgument(0);
            s.setId(1L);
            return s;
        });

        SubjectDTO dto = subjectService.create(request, user);

        assertThat(dto.getName()).isEqualTo("Mathematics");
    }

    @Test
    void create_duplicateName_throwsConflict() {
        User user = userWithId(1L);

        CreateSubjectRequest request = mock(CreateSubjectRequest.class);
        when(request.getName()).thenReturn("Mathematics");

        when(subjectRepository.existsByNameAndUser("Mathematics", user)).thenReturn(true);

        assertThatThrownBy(() -> subjectService.create(request, user))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Subject with this name already exists");

        verify(subjectRepository, never()).save(any());
    }

    // ── getByIdAndUser ────────────────────────────────────────────────────────

    @Test
    void getByIdAndUser_subjectNotFound_throwsNotFound() {
        when(subjectRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> subjectService.getByIdAndUser(99L, userWithId(1L)))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Subject not found");
    }

    @Test
    void getByIdAndUser_differentUser_throwsForbidden() {
        User owner = userWithId(1L);
        User requester = userWithId(2L);

        Subject subject = new Subject();
        subject.setId(10L);
        subject.setUser(owner);

        when(subjectRepository.findById(10L)).thenReturn(Optional.of(subject));

        assertThatThrownBy(() -> subjectService.getByIdAndUser(10L, requester))
                .isInstanceOf(ForbiddenException.class)
                .hasMessage("Access denied");
    }

    // ── finalizeSubject – grade calculation ───────────────────────────────────

    @Test
    void finalizeSubject_92points_returnsGrade10AndPassed() {
        User user = userWithId(1L);
        Subject subject = subjectOwnedBy(user, List.of(
                doneTaskWithPoints(50),
                doneTaskWithPoints(42)   // total = 92 → grade 10
        ));

        when(subjectRepository.findById(10L)).thenReturn(Optional.of(subject));
        when(subjectRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        FinalizeSubjectRequest request = new FinalizeSubjectRequest();

        SubjectDTO dto = subjectService.finalizeSubject(10L, user, request);

        assertThat(dto.getFinalGrade()).isEqualTo(10);
        assertThat(dto.getStatus()).isEqualTo(SubjectStatus.PASSED);
    }

    @Test
    void finalizeSubject_85points_returnsGrade9AndPassed() {
        User user = userWithId(1L);
        Subject subject = subjectOwnedBy(user, List.of(doneTaskWithPoints(85)));

        when(subjectRepository.findById(10L)).thenReturn(Optional.of(subject));
        when(subjectRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SubjectDTO dto = subjectService.finalizeSubject(10L, user, new FinalizeSubjectRequest());

        assertThat(dto.getFinalGrade()).isEqualTo(9);
        assertThat(dto.getStatus()).isEqualTo(SubjectStatus.PASSED);
    }

    @Test
    void finalizeSubject_55points_returnsGrade6AndPassed() {
        User user = userWithId(1L);
        Subject subject = subjectOwnedBy(user, List.of(doneTaskWithPoints(55)));

        when(subjectRepository.findById(10L)).thenReturn(Optional.of(subject));
        when(subjectRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SubjectDTO dto = subjectService.finalizeSubject(10L, user, new FinalizeSubjectRequest());

        assertThat(dto.getFinalGrade()).isEqualTo(6);
        assertThat(dto.getStatus()).isEqualTo(SubjectStatus.PASSED);
    }

    @Test
    void finalizeSubject_40points_returnsGrade5AndFailed() {
        User user = userWithId(1L);
        Subject subject = subjectOwnedBy(user, List.of(doneTaskWithPoints(40)));

        when(subjectRepository.findById(10L)).thenReturn(Optional.of(subject));
        when(subjectRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SubjectDTO dto = subjectService.finalizeSubject(10L, user, new FinalizeSubjectRequest());

        assertThat(dto.getFinalGrade()).isEqualTo(5);
        assertThat(dto.getStatus()).isEqualTo(SubjectStatus.FAILED);
        assertThat(dto.getPassedAt()).isNull();
    }

    @Test
    void finalizeSubject_manualOverride8_usesManualGradeAndPasses() {
        User user = userWithId(1L);
        Subject subject = subjectOwnedBy(user, List.of(doneTaskWithPoints(10)));

        when(subjectRepository.findById(10L)).thenReturn(Optional.of(subject));
        when(subjectRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        FinalizeSubjectRequest request = new FinalizeSubjectRequest();
        request.setManualGradeOverride(8);

        SubjectDTO dto = subjectService.finalizeSubject(10L, user, request);

        assertThat(dto.getFinalGrade()).isEqualTo(8);
        assertThat(dto.getManualGradeOverride()).isEqualTo(8);
        assertThat(dto.getStatus()).isEqualTo(SubjectStatus.PASSED);
    }

    @Test
    void finalizeSubject_manualOverride5_fails() {
        User user = userWithId(1L);
        Subject subject = subjectOwnedBy(user, List.of());

        when(subjectRepository.findById(10L)).thenReturn(Optional.of(subject));
        when(subjectRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        FinalizeSubjectRequest request = new FinalizeSubjectRequest();
        request.setManualGradeOverride(5);

        SubjectDTO dto = subjectService.finalizeSubject(10L, user, request);

        assertThat(dto.getFinalGrade()).isEqualTo(5);
        assertThat(dto.getStatus()).isEqualTo(SubjectStatus.FAILED);
    }

    // ── resetSubjectStatus ────────────────────────────────────────────────────

    @Test
    void resetSubjectStatus_clearsGradeAndRestoresInProgress() {
        User user = userWithId(1L);
        Subject subject = subjectOwnedBy(user, List.of());
        subject.setFinalGrade(9);
        subject.setStatus(SubjectStatus.PASSED);

        when(subjectRepository.findById(10L)).thenReturn(Optional.of(subject));
        when(subjectRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SubjectDTO dto = subjectService.resetSubjectStatus(10L, user);

        assertThat(dto.getStatus()).isEqualTo(SubjectStatus.IN_PROGRESS);
        assertThat(dto.getFinalGrade()).isNull();
        assertThat(dto.getPassedAt()).isNull();
    }

    // ── private helpers ───────────────────────────────────────────────────────

    private Subject subjectOwnedBy(User user, List<Task> tasks) {
        Subject subject = new Subject();
        subject.setId(10L);
        subject.setName("Math");
        subject.setUser(user);
        subject.setTasks(tasks);
        return subject;
    }
}
