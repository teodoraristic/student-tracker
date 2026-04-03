package com.studenttracker.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.studenttracker.backend.model.RefreshToken;
import com.studenttracker.backend.model.User;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    void deleteByUser(User user);

    void deleteByUserIdAndRevokedAtIsNotNull(Long userId);
}
