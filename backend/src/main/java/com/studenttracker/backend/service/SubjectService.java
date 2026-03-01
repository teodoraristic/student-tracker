package com.studenttracker.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.studenttracker.backend.dto.SubjectDTO;
import com.studenttracker.backend.dto.request.CreateSubjectRequest;
import com.studenttracker.backend.dto.request.FinalizeSubjectRequest;
import com.studenttracker.backend.exception.ConflictException;
import com.studenttracker.backend.exception.ForbiddenException;
import com.studenttracker.backend.exception.NotFoundException;
import com.studenttracker.backend.mapper.SubjectMapper;
import com.studenttracker.backend.model.Difficulty;
import com.studenttracker.backend.model.Subject;
import com.studenttracker.backend.model.SubjectStatus;
import com.studenttracker.backend.model.Task;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.repository.SubjectRepository;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    public SubjectDTO create(CreateSubjectRequest request, User user) {

        if (subjectRepository.existsByNameAndUser(request.getName(), user)) {
            throw new ConflictException("Subject with this name already exists");
        }

        Subject subject = new Subject();
        subject.setName(request.getName());
        subject.setWebsite(request.getWebsite());
        subject.setDifficulty(request.getDifficulty());
        subject.setUser(user);

        return SubjectMapper.toDTO(subjectRepository.save(subject));
    }

    public List<SubjectDTO> getAllByUser(User user) {
        return subjectRepository.findAllByUser(user)
                .stream()
                .map(SubjectMapper::toDTO)
                .toList();
    }

    public SubjectDTO getByNameAndUser(String name, User user) {
        Subject subject = subjectRepository.findByNameAndUser(name, user)
                .orElseThrow(() -> new NotFoundException("Subject not found"));

        return SubjectMapper.toDTO(subject);
    }

    public List<SubjectDTO> getAllByUserAndDifficulty(User user, Difficulty difficulty) {
        return subjectRepository.findAllByUserAndDifficulty(user, difficulty)
                .stream()
                .map(SubjectMapper::toDTO)
                .toList();
    }

    public Subject getById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Subject not found"));
    }

    public Subject getByIdAndUser(Long id, User user) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Subject not found"));

        if (!subject.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied");
        }

        return subject;
    }

    public SubjectDTO update(Long id, User user, CreateSubjectRequest request) {
        Subject subject = getByIdAndUser(id, user);
        subject.setName(request.getName());
        subject.setWebsite(request.getWebsite());
        subject.setDifficulty(request.getDifficulty());
        return SubjectMapper.toDTO(subjectRepository.save(subject));
    }

    public void delete(Long id, User user) {
        getByIdAndUser(id, user);
        subjectRepository.deleteById(id);
    }

    public SubjectDTO finalizeSubject(Long id, User user, FinalizeSubjectRequest request) {
        Subject subject = getByIdAndUser(id, user);

        // Calculate totalPoints from completed tasks
        int totalPoints = subject.getTasks() != null
                ? subject.getTasks().stream()
                        .filter(t -> t.getStatus().isDone() && t.getPoints() != null)
                        .mapToInt(Task::getPoints)
                        .sum()
                : 0;

        // Determine effective grade
        int effectiveGrade;
        if (request.getManualGradeOverride() != null) {
            effectiveGrade = request.getManualGradeOverride();
            subject.setManualGradeOverride(effectiveGrade);
        } else {
            effectiveGrade = calculateGrade(totalPoints);
        }

        subject.setFinalGrade(effectiveGrade);

        if (effectiveGrade >= 6) {
            subject.setStatus(SubjectStatus.PASSED);
            subject.setPassedAt(LocalDate.now());
        } else {
            subject.setStatus(SubjectStatus.FAILED);
            subject.setPassedAt(null);
        }

        return SubjectMapper.toDTO(subjectRepository.save(subject));
    }

    public SubjectDTO resetSubjectStatus(Long id, User user) {
        Subject subject = getByIdAndUser(id, user);
        subject.setStatus(SubjectStatus.IN_PROGRESS);
        subject.setFinalGrade(null);
        subject.setManualGradeOverride(null);
        subject.setPassedAt(null);
        return SubjectMapper.toDTO(subjectRepository.save(subject));
    }

    private int calculateGrade(int totalPoints) {
        if (totalPoints >= 91) return 10;
        if (totalPoints >= 81) return 9;
        if (totalPoints >= 71) return 8;
        if (totalPoints >= 61) return 7;
        if (totalPoints >= 51) return 6;
        return 5;
    }
}
