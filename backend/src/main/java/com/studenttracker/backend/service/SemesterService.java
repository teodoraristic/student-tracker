package com.studenttracker.backend.service;

import com.studenttracker.backend.dto.SemesterDTO;
import com.studenttracker.backend.dto.request.CreateSemesterRequest;
import com.studenttracker.backend.exception.ForbiddenException;
import com.studenttracker.backend.exception.NotFoundException;
import com.studenttracker.backend.mapper.SemesterMapper;
import com.studenttracker.backend.model.Semester;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.repository.SemesterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SemesterService {

    private final SemesterRepository semesterRepository;

    public SemesterService(SemesterRepository semesterRepository) {
        this.semesterRepository = semesterRepository;
    }

    public List<SemesterDTO> getAllByUser(User user) {
        return semesterRepository.findAllByUser(user)
                .stream()
                .map(SemesterMapper::toDTO)
                .toList();
    }

    public SemesterDTO create(CreateSemesterRequest req, User user) {
        Semester semester = new Semester();
        semester.setName(req.getName());
        semester.setType(req.getType());
        semester.setAcademicYear(req.getAcademicYear());
        semester.setStartDate(req.getStartDate());
        semester.setEndDate(req.getEndDate());
        semester.setUser(user);
        return SemesterMapper.toDTO(semesterRepository.save(semester));
    }

    public SemesterDTO update(Long id, CreateSemesterRequest req, User user) {
        Semester semester = getByIdAndUser(id, user);
        semester.setName(req.getName());
        semester.setType(req.getType());
        semester.setAcademicYear(req.getAcademicYear());
        semester.setStartDate(req.getStartDate());
        semester.setEndDate(req.getEndDate());
        return SemesterMapper.toDTO(semesterRepository.save(semester));
    }

    public void delete(Long id, User user) {
        getByIdAndUser(id, user);
        semesterRepository.deleteById(id);
    }

    public Semester getByIdAndUser(Long id, User user) {
        Semester semester = semesterRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Semester not found"));
        if (!semester.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied");
        }
        return semester;
    }
}
