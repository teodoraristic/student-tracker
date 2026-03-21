package com.studenttracker.backend.service;

import com.studenttracker.backend.dto.ExamPeriodDTO;
import com.studenttracker.backend.dto.request.CreateExamPeriodRequest;
import com.studenttracker.backend.exception.ForbiddenException;
import com.studenttracker.backend.exception.NotFoundException;
import com.studenttracker.backend.mapper.ExamPeriodMapper;
import com.studenttracker.backend.model.ExamPeriod;
import com.studenttracker.backend.model.User;
import com.studenttracker.backend.repository.ExamPeriodRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExamPeriodService {

    private final ExamPeriodRepository examPeriodRepository;

    public ExamPeriodService(ExamPeriodRepository examPeriodRepository) {
        this.examPeriodRepository = examPeriodRepository;
    }

    public List<ExamPeriodDTO> getAllByUser(User user) {
        return examPeriodRepository.findAllByUser(user)
                .stream()
                .map(ExamPeriodMapper::toDTO)
                .toList();
    }

    public ExamPeriodDTO create(CreateExamPeriodRequest req, User user) {
        ExamPeriod examPeriod = new ExamPeriod();
        examPeriod.setName(req.getName());
        examPeriod.setStartDate(req.getStartDate());
        examPeriod.setEndDate(req.getEndDate());
        examPeriod.setUser(user);
        return ExamPeriodMapper.toDTO(examPeriodRepository.save(examPeriod));
    }

    public ExamPeriodDTO update(Long id, CreateExamPeriodRequest req, User user) {
        ExamPeriod examPeriod = getByIdAndUser(id, user);
        examPeriod.setName(req.getName());
        examPeriod.setStartDate(req.getStartDate());
        examPeriod.setEndDate(req.getEndDate());
        return ExamPeriodMapper.toDTO(examPeriodRepository.save(examPeriod));
    }

    public void delete(Long id, User user) {
        getByIdAndUser(id, user);
        examPeriodRepository.deleteById(id);
    }

    public ExamPeriod getByIdAndUser(Long id, User user) {
        ExamPeriod examPeriod = examPeriodRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Exam period not found"));
        if (!examPeriod.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied");
        }
        return examPeriod;
    }
}
