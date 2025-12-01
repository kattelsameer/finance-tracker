package com.financetracker.service;

import com.financetracker.dto.tag.TagResponse;
import com.financetracker.dto.transaction.*;
import com.financetracker.entity.*;
import com.financetracker.entity.Transaction.TransactionType;
import com.financetracker.exception.ApiException;
import com.financetracker.exception.ErrorCode;
import com.financetracker.repository.*;
import com.financetracker.specification.TransactionSpecification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TransactionService {
    
    private static final Logger logger = LoggerFactory.getLogger(TransactionService.class);
    
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    
    public TransactionService(TransactionRepository transactionRepository,
                               AccountRepository accountRepository,
                               CategoryRepository categoryRepository,
                               TagRepository tagRepository,
                               UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.userRepository = userRepository;
    }
    
    @Transactional
    public TransactionResponse createTransaction(Long userId, CreateTransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        
        Account account = accountRepository.findByIdAndUserId(request.getAccountId(), userId)
                .orElseThrow(() -> new ApiException(ErrorCode.ACCOUNT_NOT_FOUND));
        
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAccount(account);
        transaction.setTransactionType(request.getTransactionType());
        transaction.setAmount(request.getAmount());
        transaction.setCurrency(request.getCurrency());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setDescription(request.getDescription());
        transaction.setNotes(request.getNotes());
        transaction.setReferenceNumber(request.getReferenceNumber());
        
        // Set category if provided
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                    .orElseThrow(() -> new ApiException(ErrorCode.CATEGORY_NOT_FOUND));
            transaction.setCategory(category);
        }
        
        // Handle transfer
        if (request.getTransactionType() == TransactionType.TRANSFER) {
            if (request.getTransferToAccountId() == null) {
                throw new ApiException(ErrorCode.INVALID_TRANSFER, "Transfer destination account is required");
            }
            if (request.getTransferToAccountId().equals(request.getAccountId())) {
                throw new ApiException(ErrorCode.INVALID_TRANSFER);
            }
            
            Account toAccount = accountRepository.findByIdAndUserId(request.getTransferToAccountId(), userId)
                    .orElseThrow(() -> new ApiException(ErrorCode.ACCOUNT_NOT_FOUND, "Destination account not found"));
            
            transaction.setTransferToAccount(toAccount);
            
            // Create the linked transfer transaction (incoming to destination account)
            Transaction linkedTransaction = new Transaction();
            linkedTransaction.setUser(user);
            linkedTransaction.setAccount(toAccount);
            linkedTransaction.setTransactionType(TransactionType.TRANSFER);
            linkedTransaction.setAmount(request.getAmount());
            linkedTransaction.setCurrency(request.getCurrency());
            linkedTransaction.setTransactionDate(request.getTransactionDate());
            linkedTransaction.setDescription(request.getDescription() != null ? 
                    request.getDescription() : "Transfer from " + account.getAccountName());
            linkedTransaction.setTransferToAccount(account);
            
            linkedTransaction = transactionRepository.save(linkedTransaction);
            transaction.setTransferTransactionId(linkedTransaction.getId());
            
            // Update balances
            account.adjustBalance(request.getAmount().negate()); // Deduct from source
            toAccount.adjustBalance(request.getAmount()); // Add to destination
            
            accountRepository.save(account);
            accountRepository.save(toAccount);
            
            // Update linked transaction with reference
            linkedTransaction.setTransferTransactionId(transaction.getId());
            transactionRepository.save(linkedTransaction);
        } else {
            // Handle regular income/expense
            if (request.getTransactionType() == TransactionType.INCOME) {
                account.adjustBalance(request.getAmount());
            } else {
                account.adjustBalance(request.getAmount().negate());
            }
            accountRepository.save(account);
        }
        
        // Handle tags
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            Set<Tag> tags = new HashSet<>(tagRepository.findByIdInAndUserId(request.getTagIds(), userId));
            transaction.setTags(tags);
        }
        
        transaction = transactionRepository.save(transaction);
        
        logger.info("Transaction created: {} for user: {}", transaction.getId(), userId);
        
        return mapToResponse(transaction);
    }
    
    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(Long userId, TransactionFilter filter, Pageable pageable) {
        Specification<Transaction> spec = buildSpecification(userId, filter);
        return transactionRepository.findAll(spec, pageable).map(this::mapToResponse);
    }
    
    @Transactional(readOnly = true)
    public TransactionResponse getTransaction(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.TRANSACTION_NOT_FOUND));
        
        return mapToResponse(transaction);
    }
    
    @Transactional
    public TransactionResponse updateTransaction(Long userId, Long transactionId, UpdateTransactionRequest request) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.TRANSACTION_NOT_FOUND));
        
        // Can't update transfer transactions directly
        if (transaction.getTransactionType() == TransactionType.TRANSFER) {
            throw new ApiException(ErrorCode.OPERATION_NOT_ALLOWED, "Transfer transactions cannot be updated");
        }
        
        Account oldAccount = transaction.getAccount();
        BigDecimal oldAmount = transaction.getAmount();
        TransactionType oldType = transaction.getTransactionType();
        
        // Reverse the old balance effect
        reverseBalanceEffect(oldAccount, oldAmount, oldType);
        
        // Update transaction fields
        updateTransactionFields(transaction, request, userId);
        
        // Apply new balance effect
        Account currentAccount = transaction.getAccount();
        BigDecimal currentAmount = transaction.getAmount();
        applyBalanceEffect(currentAccount, currentAmount, transaction.getTransactionType());
        
        // Save accounts
        accountRepository.save(oldAccount);
        if (!oldAccount.getId().equals(currentAccount.getId())) {
            accountRepository.save(currentAccount);
        }
        
        transaction = transactionRepository.save(transaction);
        
        logger.info("Transaction updated: {} for user: {}", transactionId, userId);
        
        return mapToResponse(transaction);
    }
    
    /**
     * Reverses the balance effect of a transaction on the account.
     */
    private void reverseBalanceEffect(Account account, BigDecimal amount, TransactionType type) {
        if (type == TransactionType.INCOME) {
            account.adjustBalance(amount.negate());
        } else {
            account.adjustBalance(amount);
        }
    }
    
    /**
     * Applies the balance effect of a transaction on the account.
     */
    private void applyBalanceEffect(Account account, BigDecimal amount, TransactionType type) {
        if (type == TransactionType.INCOME) {
            account.adjustBalance(amount);
        } else {
            account.adjustBalance(amount.negate());
        }
    }
    
    /**
     * Updates transaction fields from the request.
     */
    private void updateTransactionFields(Transaction transaction, UpdateTransactionRequest request, Long userId) {
        updateAccountIfChanged(transaction, request, userId);
        updateCategoryIfProvided(transaction, request, userId);
        updateBasicFields(transaction, request);
        updateTagsIfProvided(transaction, request, userId);
    }
    
    private void updateAccountIfChanged(Transaction transaction, UpdateTransactionRequest request, Long userId) {
        if (request.getAccountId() != null && !request.getAccountId().equals(transaction.getAccount().getId())) {
            Account newAccount = accountRepository.findByIdAndUserId(request.getAccountId(), userId)
                    .orElseThrow(() -> new ApiException(ErrorCode.ACCOUNT_NOT_FOUND));
            transaction.setAccount(newAccount);
        }
    }
    
    private void updateCategoryIfProvided(Transaction transaction, UpdateTransactionRequest request, Long userId) {
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                    .orElseThrow(() -> new ApiException(ErrorCode.CATEGORY_NOT_FOUND));
            transaction.setCategory(category);
        }
    }
    
    private void updateBasicFields(Transaction transaction, UpdateTransactionRequest request) {
        if (request.getAmount() != null) {
            transaction.setAmount(request.getAmount());
        }
        if (request.getCurrency() != null) {
            transaction.setCurrency(request.getCurrency());
        }
        if (request.getTransactionDate() != null) {
            transaction.setTransactionDate(request.getTransactionDate());
        }
        if (request.getDescription() != null) {
            transaction.setDescription(request.getDescription());
        }
        if (request.getNotes() != null) {
            transaction.setNotes(request.getNotes());
        }
        if (request.getReferenceNumber() != null) {
            transaction.setReferenceNumber(request.getReferenceNumber());
        }
    }
    
    private void updateTagsIfProvided(Transaction transaction, UpdateTransactionRequest request, Long userId) {
        if (request.getTagIds() != null) {
            Set<Tag> tags = new HashSet<>(tagRepository.findByIdInAndUserId(request.getTagIds(), userId));
            transaction.setTags(tags);
        }
    }
    
    @Transactional
    public void deleteTransaction(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.TRANSACTION_NOT_FOUND));
        
        Account account = transaction.getAccount();
        
        // Reverse the balance effect
        if (transaction.getTransactionType() == TransactionType.TRANSFER) {
            // Delete the linked transfer transaction too
            if (transaction.getTransferTransactionId() != null) {
                Transaction linkedTransaction = transactionRepository.findById(transaction.getTransferTransactionId())
                        .orElse(null);
                if (linkedTransaction != null) {
                    Account linkedAccount = linkedTransaction.getAccount();
                    linkedAccount.adjustBalance(transaction.getAmount().negate());
                    accountRepository.save(linkedAccount);
                    transactionRepository.delete(linkedTransaction);
                }
            }
            account.adjustBalance(transaction.getAmount());
        } else if (transaction.getTransactionType() == TransactionType.INCOME) {
            account.adjustBalance(transaction.getAmount().negate());
        } else {
            account.adjustBalance(transaction.getAmount());
        }
        
        accountRepository.save(account);
        transactionRepository.delete(transaction);
        
        logger.info("Transaction deleted: {} for user: {}", transactionId, userId);
    }
    
    @Transactional(readOnly = true)
    public Page<TransactionResponse> advancedSearch(TransactionSearchRequest searchRequest, Long userId) {
        // Build specification using TransactionSpecification
        Specification<Transaction> spec = TransactionSpecification.buildSearchSpecification(userId, searchRequest);
        
        // Create pageable with sorting
        Sort sort = Sort.by(
            searchRequest.getSortDirection() != null && 
            searchRequest.getSortDirection().equalsIgnoreCase("ASC") 
                ? Sort.Direction.ASC 
                : Sort.Direction.DESC,
            searchRequest.getSortBy() != null ? searchRequest.getSortBy() : "transactionDate"
        );
        
        Pageable pageable = PageRequest.of(
            searchRequest.getPage() != null ? searchRequest.getPage() : 0,
            searchRequest.getSize() != null ? searchRequest.getSize() : 20,
            sort
        );
        
        Page<Transaction> transactions = transactionRepository.findAll(spec, pageable);
        return transactions.map(this::mapToResponse);
    }
    
    private Specification<Transaction> buildSpecification(Long userId, TransactionFilter filter) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            
            predicates.add(cb.equal(root.get("user").get("id"), userId));
            
            if (filter != null) {
                addFilterPredicates(predicates, filter, root, cb);
            }
            
            return cb.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }
    
    /**
     * Adds filter predicates based on the provided filter criteria.
     */
    private void addFilterPredicates(
            List<jakarta.persistence.criteria.Predicate> predicates,
            TransactionFilter filter,
            jakarta.persistence.criteria.Root<Transaction> root,
            jakarta.persistence.criteria.CriteriaBuilder cb) {
        
        addAccountFilter(predicates, filter, root, cb);
        addCategoryFilter(predicates, filter, root, cb);
        addTypeFilter(predicates, filter, root, cb);
        addDateFilters(predicates, filter, root, cb);
        addSearchTermFilter(predicates, filter, root, cb);
        addRecurringFilter(predicates, filter, root, cb);
    }
    
    private void addAccountFilter(
            List<jakarta.persistence.criteria.Predicate> predicates,
            TransactionFilter filter,
            jakarta.persistence.criteria.Root<Transaction> root,
            jakarta.persistence.criteria.CriteriaBuilder cb) {
        if (filter.getAccountId() != null) {
            predicates.add(cb.equal(root.get("account").get("id"), filter.getAccountId()));
        }
    }
    
    private void addCategoryFilter(
            List<jakarta.persistence.criteria.Predicate> predicates,
            TransactionFilter filter,
            jakarta.persistence.criteria.Root<Transaction> root,
            jakarta.persistence.criteria.CriteriaBuilder cb) {
        if (filter.getCategoryId() != null) {
            predicates.add(cb.equal(root.get("category").get("id"), filter.getCategoryId()));
        }
    }
    
    private void addTypeFilter(
            List<jakarta.persistence.criteria.Predicate> predicates,
            TransactionFilter filter,
            jakarta.persistence.criteria.Root<Transaction> root,
            jakarta.persistence.criteria.CriteriaBuilder cb) {
        if (filter.getTransactionType() != null) {
            predicates.add(cb.equal(root.get("transactionType"), filter.getTransactionType()));
        }
    }
    
    private void addDateFilters(
            List<jakarta.persistence.criteria.Predicate> predicates,
            TransactionFilter filter,
            jakarta.persistence.criteria.Root<Transaction> root,
            jakarta.persistence.criteria.CriteriaBuilder cb) {
        if (filter.getStartDate() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("transactionDate"), filter.getStartDate()));
        }
        if (filter.getEndDate() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("transactionDate"), filter.getEndDate()));
        }
    }
    
    private void addSearchTermFilter(
            List<jakarta.persistence.criteria.Predicate> predicates,
            TransactionFilter filter,
            jakarta.persistence.criteria.Root<Transaction> root,
            jakarta.persistence.criteria.CriteriaBuilder cb) {
        if (filter.getSearchTerm() != null && !filter.getSearchTerm().isBlank()) {
            String searchPattern = "%" + filter.getSearchTerm().toLowerCase() + "%";
            predicates.add(cb.or(
                    cb.like(cb.lower(root.get("description")), searchPattern),
                    cb.like(cb.lower(root.get("notes")), searchPattern)
            ));
        }
    }
    
    private void addRecurringFilter(
            List<jakarta.persistence.criteria.Predicate> predicates,
            TransactionFilter filter,
            jakarta.persistence.criteria.Root<Transaction> root,
            jakarta.persistence.criteria.CriteriaBuilder cb) {
        if (filter.getIsRecurring() != null) {
            predicates.add(cb.equal(root.get("isRecurring"), filter.getIsRecurring()));
        }
    }
    
    private TransactionResponse mapToResponse(Transaction transaction) {
        TransactionResponse response = new TransactionResponse();
        response.setId(transaction.getId());
        response.setAccountId(transaction.getAccount().getId());
        response.setAccountName(transaction.getAccount().getAccountName());
        response.setTransactionType(transaction.getTransactionType());
        response.setAmount(transaction.getAmount());
        response.setCurrency(transaction.getCurrency());
        response.setTransactionDate(transaction.getTransactionDate());
        response.setDescription(transaction.getDescription());
        response.setNotes(transaction.getNotes());
        response.setReferenceNumber(transaction.getReferenceNumber());
        response.setIsRecurring(transaction.getIsRecurring());
        response.setRecurringTransactionId(transaction.getRecurringTransactionId());
        response.setTransferTransactionId(transaction.getTransferTransactionId());
        response.setCreatedAt(transaction.getCreatedAt());
        response.setUpdatedAt(transaction.getUpdatedAt());
        
        if (transaction.getCategory() != null) {
            response.setCategoryId(transaction.getCategory().getId());
            response.setCategoryName(transaction.getCategory().getCategoryName());
        }
        
        if (transaction.getTransferToAccount() != null) {
            response.setTransferToAccountId(transaction.getTransferToAccount().getId());
            response.setTransferToAccountName(transaction.getTransferToAccount().getAccountName());
        }
        
        if (transaction.getTags() != null && !transaction.getTags().isEmpty()) {
            response.setTags(transaction.getTags().stream()
                    .map(tag -> new TagResponse(tag.getId(), tag.getTagName(), tag.getColorCode(), tag.getCreatedAt()))
                    .collect(Collectors.toList()));
        }
        
        return response;
    }
}
