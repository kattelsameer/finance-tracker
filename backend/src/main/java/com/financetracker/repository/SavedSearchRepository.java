package com.financetracker.repository;

import com.financetracker.entity.SavedSearch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedSearchRepository extends JpaRepository<SavedSearch, Long> {
    
    List<SavedSearch> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Optional<SavedSearch> findByIdAndUserId(Long id, Long userId);
    
    Optional<SavedSearch> findByUserIdAndIsDefaultTrue(Long userId);
    
    boolean existsByUserIdAndSearchName(Long userId, String searchName);
}
