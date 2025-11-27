package com.financetracker.service;

import com.financetracker.dto.tag.CreateTagRequest;
import com.financetracker.dto.tag.TagResponse;
import com.financetracker.dto.tag.UpdateTagRequest;
import com.financetracker.entity.Tag;
import com.financetracker.entity.User;
import com.financetracker.exception.ApiException;
import com.financetracker.exception.ErrorCode;
import com.financetracker.repository.TagRepository;
import com.financetracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TagService {
    
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    
    public TagService(TagRepository tagRepository, UserRepository userRepository) {
        this.tagRepository = tagRepository;
        this.userRepository = userRepository;
    }
    
    public TagResponse createTag(Long userId, CreateTagRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        
        // Check for duplicate tag name
        if (tagRepository.existsByUserIdAndTagName(userId, request.getTagName())) {
            throw new ApiException(ErrorCode.TAG_ALREADY_EXISTS);
        }
        
        Tag tag = new Tag();
        tag.setUser(user);
        tag.setTagName(request.getTagName());
        tag.setColorCode(request.getColorCode());
        
        Tag savedTag = tagRepository.save(tag);
        return mapToResponse(savedTag);
    }
    
    @Transactional(readOnly = true)
    public List<TagResponse> getAllTagsForUser(Long userId) {
        List<Tag> tags = tagRepository.findByUserIdOrderByTagNameAsc(userId);
        return tags.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public TagResponse getTagById(Long userId, Long tagId) {
        Tag tag = tagRepository.findByIdAndUserId(tagId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.TAG_NOT_FOUND));
        
        return mapToResponse(tag);
    }
    
    public TagResponse updateTag(Long userId, Long tagId, UpdateTagRequest request) {
        Tag tag = tagRepository.findByIdAndUserId(tagId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.TAG_NOT_FOUND));
        
        // Check for duplicate tag name if changing name
        if (request.getTagName() != null && !request.getTagName().equals(tag.getTagName())) {
            if (tagRepository.existsByUserIdAndTagName(userId, request.getTagName())) {
                throw new ApiException(ErrorCode.TAG_ALREADY_EXISTS);
            }
            tag.setTagName(request.getTagName());
        }
        
        if (request.getColorCode() != null) {
            tag.setColorCode(request.getColorCode());
        }
        
        Tag updatedTag = tagRepository.save(tag);
        return mapToResponse(updatedTag);
    }
    
    public void deleteTag(Long userId, Long tagId) {
        Tag tag = tagRepository.findByIdAndUserId(tagId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.TAG_NOT_FOUND));
        
        // Tags are automatically removed from transactions due to cascade settings
        tagRepository.delete(tag);
    }
    
    @Transactional(readOnly = true)
    public boolean tagExists(Long userId, Long tagId) {
        return tagRepository.existsByIdAndUserId(tagId, userId);
    }
    
    private TagResponse mapToResponse(Tag tag) {
        return new TagResponse(
                tag.getId(),
                tag.getTagName(),
                tag.getColorCode(),
                tag.getCreatedAt()
        );
    }
}
