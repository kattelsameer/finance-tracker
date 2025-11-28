package com.financetracker.service;

import com.financetracker.dto.CreateSavedSearchRequest;
import com.financetracker.dto.SavedSearchResponse;
import com.financetracker.entity.SavedSearch;
import com.financetracker.entity.User;
import com.financetracker.exception.ApiException;
import com.financetracker.exception.ErrorCode;
// ValidationException replaced
import com.financetracker.repository.SavedSearchRepository;
import com.financetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedSearchService {
    
    private final SavedSearchRepository savedSearchRepository;
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public List<SavedSearchResponse> getAllSavedSearches(Long userId) {
        return savedSearchRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public SavedSearchResponse getSavedSearchById(Long id, Long userId) {
        SavedSearch savedSearch = savedSearchRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Saved search not found"));
        return mapToResponse(savedSearch);
    }
    
    @Transactional
    public SavedSearchResponse createSavedSearch(CreateSavedSearchRequest request, Long userId) {
        // Check if search name already exists for user
        if (savedSearchRepository.existsByUserIdAndSearchName(userId, request.getSearchName())) {
            throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "A saved search with this name already exists");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));
        
        // If this search should be default, unset any existing default
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            savedSearchRepository.findByUserIdAndIsDefaultTrue(userId)
                    .ifPresent(existingDefault -> {
                        existingDefault.setIsDefault(false);
                        savedSearchRepository.save(existingDefault);
                    });
        }
        
        SavedSearch savedSearch = SavedSearch.builder()
                .user(user)
                .searchName(request.getSearchName())
                .searchCriteria(request.getSearchCriteria())
                .isDefault(request.getIsDefault())
                .build();
        
        savedSearch = savedSearchRepository.save(savedSearch);
        return mapToResponse(savedSearch);
    }
    
    @Transactional
    public SavedSearchResponse updateSavedSearch(Long id, CreateSavedSearchRequest request, Long userId) {
        SavedSearch savedSearch = savedSearchRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Saved search not found"));
        
        // Check if new name conflicts with another search
        if (!savedSearch.getSearchName().equals(request.getSearchName()) &&
                savedSearchRepository.existsByUserIdAndSearchName(userId, request.getSearchName())) {
            throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "A saved search with this name already exists");
        }
        
        // If this search should be default, unset any existing default
        if (Boolean.TRUE.equals(request.getIsDefault()) && !Boolean.TRUE.equals(savedSearch.getIsDefault())) {
            savedSearchRepository.findByUserIdAndIsDefaultTrue(userId)
                    .ifPresent(existingDefault -> {
                        if (!existingDefault.getId().equals(id)) {
                            existingDefault.setIsDefault(false);
                            savedSearchRepository.save(existingDefault);
                        }
                    });
        }
        
        savedSearch.setSearchName(request.getSearchName());
        savedSearch.setSearchCriteria(request.getSearchCriteria());
        savedSearch.setIsDefault(request.getIsDefault());
        
        savedSearch = savedSearchRepository.save(savedSearch);
        return mapToResponse(savedSearch);
    }
    
    @Transactional
    public void deleteSavedSearch(Long id, Long userId) {
        SavedSearch savedSearch = savedSearchRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Saved search not found"));
        savedSearchRepository.delete(savedSearch);
    }
    
    @Transactional
    public SavedSearchResponse setDefaultSearch(Long id, Long userId) {
        SavedSearch savedSearch = savedSearchRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Saved search not found"));
        
        // Unset any existing default
        savedSearchRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(existingDefault -> {
                    if (!existingDefault.getId().equals(id)) {
                        existingDefault.setIsDefault(false);
                        savedSearchRepository.save(existingDefault);
                    }
                });
        
        savedSearch.setIsDefault(true);
        savedSearch = savedSearchRepository.save(savedSearch);
        return mapToResponse(savedSearch);
    }
    
    private SavedSearchResponse mapToResponse(SavedSearch savedSearch) {
        return SavedSearchResponse.builder()
                .id(savedSearch.getId())
                .searchName(savedSearch.getSearchName())
                .searchCriteria(savedSearch.getSearchCriteria())
                .isDefault(savedSearch.getIsDefault())
                .createdAt(savedSearch.getCreatedAt())
                .updatedAt(savedSearch.getUpdatedAt())
                .build();
    }
}
