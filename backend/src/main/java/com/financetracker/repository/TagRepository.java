package com.financetracker.repository;

import com.financetracker.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    
    List<Tag> findByUserIdOrderByTagNameAsc(Long userId);
    
    Optional<Tag> findByIdAndUserId(Long id, Long userId);
    
    boolean existsByIdAndUserId(Long id, Long userId);
    
    boolean existsByUserIdAndTagName(Long userId, String tagName);
    
    List<Tag> findByIdInAndUserId(Set<Long> ids, Long userId);
    
    Optional<Tag> findByUserIdAndTagName(Long userId, String tagName);
}
