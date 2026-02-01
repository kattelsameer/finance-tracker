
package com.financetracker.service;

import org.springframework.lang.NonNull;
import java.util.Objects;

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
@SuppressWarnings("null")
public class TagService {
    
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    
    public TagService(TagRepository tagRepository, UserRepository userRepository) {
        this.tagRepository = tagRepository;
        this.userRepository = userRepository;
    }
    
    public TagResponse createTag(@NonNull Long userId, @NonNull CreateTagRequest request) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        // Check for duplicate tag name
        if (tagRepository.existsByUserIdAndTagName(Objects.requireNonNull(userId), Objects.requireNonNull(request.getTagName()))) {
            throw new ApiException(ErrorCode.TAG_ALREADY_EXISTS);
        }

        Tag tag = new Tag();
        tag.setUser(user);
        tag.setTagName(request.getTagName());
        tag.setColorCode(request.getColorCode());

        Tag savedTag = tagRepository.save(Objects.requireNonNull(tag));
        return mapToResponse(savedTag);
    }
    
    @Transactional(readOnly = true)
    public List<TagResponse> getAllTagsForUser(@NonNull Long userId) {
        List<Tag> tags = tagRepository.findByUserIdOrderByTagNameAsc(Objects.requireNonNull(userId));
        return tags.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public TagResponse getTagById(@NonNull Long userId, @NonNull Long tagId) {
        Tag tag = tagRepository.findByIdAndUserId(Objects.requireNonNull(tagId), Objects.requireNonNull(userId))
                .orElseThrow(() -> new ApiException(ErrorCode.TAG_NOT_FOUND));
        return mapToResponse(tag);
    }
    
    public TagResponse updateTag(@NonNull Long userId, @NonNull Long tagId, @NonNull UpdateTagRequest request) {
        Tag tag = tagRepository.findByIdAndUserId(Objects.requireNonNull(tagId), Objects.requireNonNull(userId))
                .orElseThrow(() -> new ApiException(ErrorCode.TAG_NOT_FOUND));

        // Check for duplicate tag name if changing name
        if (request.getTagName() != null && !request.getTagName().equals(tag.getTagName())) {
            if (tagRepository.existsByUserIdAndTagName(Objects.requireNonNull(userId), Objects.requireNonNull(request.getTagName()))) {
                throw new ApiException(ErrorCode.TAG_ALREADY_EXISTS);
            }
            tag.setTagName(request.getTagName());
        }

        if (request.getColorCode() != null) {
            tag.setColorCode(request.getColorCode());
        }

        Tag updatedTag = tagRepository.save(Objects.requireNonNull(tag));
        return mapToResponse(updatedTag);
    }
    
    public void deleteTag(@NonNull Long userId, @NonNull Long tagId) {
        Tag tag = tagRepository.findByIdAndUserId(Objects.requireNonNull(tagId), Objects.requireNonNull(userId))
                .orElseThrow(() -> new ApiException(ErrorCode.TAG_NOT_FOUND));
        // Tags are automatically removed from transactions due to cascade settings
        tagRepository.delete(Objects.requireNonNull(tag));
    }
    
    @Transactional(readOnly = true)
    public boolean tagExists(@NonNull Long userId, @NonNull Long tagId) {
        return tagRepository.existsByIdAndUserId(Objects.requireNonNull(tagId), Objects.requireNonNull(userId));
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
