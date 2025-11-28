package com.financetracker.specification;

import com.financetracker.dto.transaction.TransactionSearchRequest;
import com.financetracker.entity.Transaction;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class TransactionSpecification {
    
    public static Specification<Transaction> buildSearchSpecification(Long userId, TransactionSearchRequest request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Always filter by user
            predicates.add(criteriaBuilder.equal(root.get("user").get("id"), userId));
            
            // Search term (full-text search in description and notes)
            if (request.getSearchTerm() != null && !request.getSearchTerm().trim().isEmpty()) {
                String searchPattern = "%" + request.getSearchTerm().toLowerCase() + "%";
                Predicate descriptionPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("description")), searchPattern);
                Predicate notesPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("notes")), searchPattern);
                predicates.add(criteriaBuilder.or(descriptionPredicate, notesPredicate));
            }
            
            // Date range
            if (request.getStartDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("transactionDate"), request.getStartDate()));
            }
            if (request.getEndDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("transactionDate"), request.getEndDate()));
            }
            
            // Account filter
            if (request.getAccountId() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("account").get("id"), request.getAccountId()));
            }
            
            // Category filter
            if (request.getCategoryId() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("category").get("id"), request.getCategoryId()));
            }
            
            // Transaction type filter
            if (request.getTransactionType() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("transactionType"), request.getTransactionType()));
            }
            
            // Amount range
            if (request.getMinAmount() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("amount"), request.getMinAmount()));
            }
            if (request.getMaxAmount() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("amount"), request.getMaxAmount()));
            }
            
            // Currency filter
            if (request.getCurrency() != null && !request.getCurrency().trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                    root.get("currency"), request.getCurrency()));
            }
            
            // Recurring filter
            if (request.getIsRecurring() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("isRecurring"), request.getIsRecurring()));
            }
            
            // Tag filter (transactions must have ALL specified tags)
            if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
                for (Long tagId : request.getTagIds()) {
                    predicates.add(criteriaBuilder.isMember(
                        tagId, root.join("tags").get("id")));
                }
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
