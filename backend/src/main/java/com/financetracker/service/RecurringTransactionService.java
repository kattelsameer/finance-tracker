
package com.financetracker.service;


import com.financetracker.dto.recurring.CreateRecurringTransactionRequest;
import com.financetracker.dto.recurring.RecurringTransactionResponse;
import com.financetracker.dto.recurring.UpdateRecurringTransactionRequest;
import com.financetracker.entity.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.financetracker.exception.ApiException;
import com.financetracker.exception.ErrorCode;
import com.financetracker.repository.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@SuppressWarnings("null")
public class RecurringTransactionService {
    
    private static final Logger logger = LoggerFactory.getLogger(RecurringTransactionService.class);
    
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    
    public RecurringTransactionService(
            RecurringTransactionRepository recurringTransactionRepository,
            UserRepository userRepository,
            AccountRepository accountRepository,
            CategoryRepository categoryRepository,
            TransactionRepository transactionRepository,
            @Lazy NotificationService notificationService) {
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.notificationService = notificationService;
    }
    
    @SuppressWarnings("null")
    public RecurringTransactionResponse createRecurringTransaction(Long userId, CreateRecurringTransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        
        Account account = accountRepository.findByIdAndUserId(request.getAccountId(), userId)
                .orElseThrow(() -> new ApiException(ErrorCode.ACCOUNT_NOT_FOUND));
        
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                    .orElseThrow(() -> new ApiException(ErrorCode.CATEGORY_NOT_FOUND));
        }
        
        Account transferToAccount = null;
        if (request.getTransferToAccountId() != null) {
            transferToAccount = accountRepository.findByIdAndUserId(request.getTransferToAccountId(), userId)
                    .orElseThrow(() -> new ApiException(ErrorCode.ACCOUNT_NOT_FOUND));
            
            if (request.getTransactionType() != Transaction.TransactionType.TRANSFER) {
                throw new ApiException(ErrorCode.INVALID_TRANSFER_TRANSACTION);
            }
        }
        
        // Validate end date
        if (request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
            throw new ApiException(ErrorCode.INVALID_DATE_RANGE);
        }
        
        // Calculate next occurrence
        LocalDate nextOccurrence = calculateNextOccurrence(
                request.getStartDate(),
                request.getFrequency(),
                request.getDayOfMonth(),
                request.getDayOfWeek()
        );
        
        RecurringTransaction recurringTransaction = RecurringTransaction.builder()
                .user(user)
                .account(account)
                .category(category)
                .transactionType(request.getTransactionType())
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .description(request.getDescription())
                .frequency(request.getFrequency())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .nextOccurrence(nextOccurrence)
                .dayOfMonth(request.getDayOfMonth())
                .dayOfWeek(request.getDayOfWeek())
                .transferToAccount(transferToAccount)
                .autoPost(request.getAutoPost() != null ? request.getAutoPost() : true)
                .isActive(true)
                .build();
        
        RecurringTransaction saved = recurringTransactionRepository.save(recurringTransaction);
        return mapToResponse(saved);
    }
    
    @Transactional(readOnly = true)
    public List<RecurringTransactionResponse> getAllRecurringTransactions(Long userId) {
        List<RecurringTransaction> recurringTransactions = 
                recurringTransactionRepository.findByUserIdOrderByNextOccurrenceAsc(userId);
        return recurringTransactions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<RecurringTransactionResponse> getActiveRecurringTransactions(Long userId) {
        List<RecurringTransaction> recurringTransactions = 
                recurringTransactionRepository.findByUserIdAndIsActiveTrueOrderByNextOccurrenceAsc(userId);
        return recurringTransactions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    @SuppressWarnings("null")
    public RecurringTransactionResponse getRecurringTransactionById(Long userId, Long recurringId) {
        RecurringTransaction recurringTransaction = recurringTransactionRepository
                .findByIdAndUserId(recurringId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.RECURRING_TRANSACTION_NOT_FOUND));
        
        return mapToResponse(recurringTransaction);
    }
    
    @SuppressWarnings("null")
    public RecurringTransactionResponse updateRecurringTransaction(
            Long userId, Long recurringId, UpdateRecurringTransactionRequest request) {
        
        RecurringTransaction recurringTransaction = recurringTransactionRepository
                .findByIdAndUserId(recurringId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.RECURRING_TRANSACTION_NOT_FOUND));
        
        if (request.getAccountId() != null) {
            Account account = accountRepository.findByIdAndUserId(request.getAccountId(), userId)
                    .orElseThrow(() -> new ApiException(ErrorCode.ACCOUNT_NOT_FOUND));
            recurringTransaction.setAccount(account);
        }
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                    .orElseThrow(() -> new ApiException(ErrorCode.CATEGORY_NOT_FOUND));
            recurringTransaction.setCategory(category);
        }
        
        if (request.getTransactionType() != null) {
            recurringTransaction.setTransactionType(request.getTransactionType());
        }
        
        if (request.getAmount() != null) {
            recurringTransaction.setAmount(request.getAmount());
        }
        
        if (request.getCurrency() != null) {
            recurringTransaction.setCurrency(request.getCurrency());
        }
        
        if (request.getDescription() != null) {
            recurringTransaction.setDescription(request.getDescription());
        }
        
        if (request.getFrequency() != null) {
            recurringTransaction.setFrequency(request.getFrequency());
            // Recalculate next occurrence if frequency changes
            LocalDate nextOccurrence = calculateNextOccurrence(
                    recurringTransaction.getStartDate(),
                    request.getFrequency(),
                    request.getDayOfMonth() != null ? request.getDayOfMonth() : recurringTransaction.getDayOfMonth(),
                    request.getDayOfWeek() != null ? request.getDayOfWeek() : recurringTransaction.getDayOfWeek()
            );
            recurringTransaction.setNextOccurrence(nextOccurrence);
        }
        
        if (request.getStartDate() != null) {
            recurringTransaction.setStartDate(request.getStartDate());
        }
        
        if (request.getEndDate() != null) {
            LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : recurringTransaction.getStartDate();
            if (request.getEndDate().isBefore(startDate)) {
                throw new ApiException(ErrorCode.INVALID_DATE_RANGE);
            }
            recurringTransaction.setEndDate(request.getEndDate());
        }
        
        if (request.getDayOfMonth() != null) {
            recurringTransaction.setDayOfMonth(request.getDayOfMonth());
        }
        
        if (request.getDayOfWeek() != null) {
            recurringTransaction.setDayOfWeek(request.getDayOfWeek());
        }
        
        if (request.getTransferToAccountId() != null) {
            Account transferToAccount = accountRepository.findByIdAndUserId(request.getTransferToAccountId(), userId)
                    .orElseThrow(() -> new ApiException(ErrorCode.ACCOUNT_NOT_FOUND));
            recurringTransaction.setTransferToAccount(transferToAccount);
        }
        
        if (request.getIsActive() != null) {
            recurringTransaction.setIsActive(request.getIsActive());
        }
        
        if (request.getAutoPost() != null) {
            recurringTransaction.setAutoPost(request.getAutoPost());
        }
        
        RecurringTransaction updated = recurringTransactionRepository.save(recurringTransaction);
        return mapToResponse(updated);
    }
    
    @SuppressWarnings("null")
    public void deleteRecurringTransaction(Long userId, Long recurringId) {
        RecurringTransaction recurringTransaction = recurringTransactionRepository
                .findByIdAndUserId(recurringId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.RECURRING_TRANSACTION_NOT_FOUND));
        
        recurringTransactionRepository.delete(recurringTransaction);
    }
    
    /**
     * Process due recurring transactions and create actual transactions
     */
    public void processDueRecurringTransactions() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> dueTransactions = 
                recurringTransactionRepository.findAllDueRecurringTransactions(today);
        
        for (RecurringTransaction recurring : dueTransactions) {
            try {
                createTransactionFromRecurring(recurring);
                updateNextOccurrence(recurring);
            } catch (Exception e) {
                // Log error but continue processing other recurring transactions
                logger.error("Error processing recurring transaction {}: {}", recurring.getId(), e.getMessage(), e);
            }
        }
    }

    /**
     * Daily at 8 AM: send RECURRING_TRANSACTION_DUE reminders for recurring transactions
     * due within the next 3 days so users have advance notice.
     */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void sendUpcomingRecurringReminders() {
        LocalDate today = LocalDate.now();
        LocalDate cutoff = today.plusDays(3);
        List<RecurringTransaction> upcoming =
                recurringTransactionRepository.findUpcomingByDateRange(today, cutoff);
        logger.info("Sending recurring reminders for {} upcoming transactions", upcoming.size());
        for (RecurringTransaction rt : upcoming) {
            try {
                Long userId = rt.getUser().getId();
                notificationService.triggerRecurringReminder(
                        userId,
                        rt.getId(),
                        rt.getDescription(),
                        rt.getAmount(),
                        rt.getCurrency(),
                        rt.getNextOccurrence().toString());
            } catch (Exception e) {
                logger.warn("Failed to send reminder for recurring {}: {}", rt.getId(), e.getMessage());
            }
        }
    }
    
    private void createTransactionFromRecurring(RecurringTransaction recurring) {
        Transaction transaction = new Transaction();
        transaction.setUser(recurring.getUser());
        transaction.setAccount(recurring.getAccount());
        transaction.setCategory(recurring.getCategory());
        transaction.setTransactionType(recurring.getTransactionType());
        transaction.setAmount(recurring.getAmount());
        transaction.setCurrency(recurring.getCurrency());
        transaction.setTransactionDate(recurring.getNextOccurrence());
        transaction.setDescription(recurring.getDescription());
        transaction.setIsRecurring(true);
        transaction.setRecurringTransactionId(recurring.getId());
        transaction.setTransferToAccount(recurring.getTransferToAccount());
        
        transactionRepository.save(transaction);
    }
    
    private void updateNextOccurrence(RecurringTransaction recurring) {
        LocalDate nextOccurrence = calculateNextOccurrence(
                recurring.getNextOccurrence(),
                recurring.getFrequency(),
                recurring.getDayOfMonth(),
                recurring.getDayOfWeek()
        );
        
        // Check if end date has been reached
        if (recurring.getEndDate() != null && nextOccurrence.isAfter(recurring.getEndDate())) {
            recurring.setIsActive(false);
        }
        
        recurring.setNextOccurrence(nextOccurrence);
        recurringTransactionRepository.save(recurring);
    }
    
    private LocalDate calculateNextOccurrence(LocalDate fromDate, RecurringTransaction.Frequency frequency,
                                               Integer dayOfMonth, Integer dayOfWeek) {
        LocalDate nextDate = fromDate;
        
        switch (frequency) {
            case DAILY:
                nextDate = fromDate.plusDays(1);
                break;
                
            case WEEKLY:
                nextDate = fromDate.plusWeeks(1);
                if (dayOfWeek != null) {
                    DayOfWeek targetDay = DayOfWeek.of(dayOfWeek);
                    nextDate = nextDate.with(TemporalAdjusters.nextOrSame(targetDay));
                }
                break;
                
            case BIWEEKLY:
                nextDate = fromDate.plusWeeks(2);
                if (dayOfWeek != null) {
                    DayOfWeek targetDay = DayOfWeek.of(dayOfWeek);
                    nextDate = nextDate.with(TemporalAdjusters.nextOrSame(targetDay));
                }
                break;
                
            case MONTHLY:
                nextDate = fromDate.plusMonths(1);
                if (dayOfMonth != null) {
                    int maxDay = nextDate.lengthOfMonth();
                    int targetDay = Math.min(dayOfMonth, maxDay);
                    nextDate = nextDate.withDayOfMonth(targetDay);
                }
                break;
                
            case QUARTERLY:
                nextDate = fromDate.plusMonths(3);
                if (dayOfMonth != null) {
                    int maxDay = nextDate.lengthOfMonth();
                    int targetDay = Math.min(dayOfMonth, maxDay);
                    nextDate = nextDate.withDayOfMonth(targetDay);
                }
                break;
                
            case YEARLY:
                nextDate = fromDate.plusYears(1);
                break;
        }
        
        return nextDate;
    }
    
    private RecurringTransactionResponse mapToResponse(RecurringTransaction recurring) {
        return RecurringTransactionResponse.builder()
                .id(recurring.getId())
                .accountId(recurring.getAccount().getId())
                .accountName(recurring.getAccount().getAccountName())
                .categoryId(recurring.getCategory() != null ? recurring.getCategory().getId() : null)
                .categoryName(recurring.getCategory() != null ? recurring.getCategory().getCategoryName() : null)
                .transactionType(recurring.getTransactionType())
                .amount(recurring.getAmount())
                .currency(recurring.getCurrency())
                .description(recurring.getDescription())
                .frequency(recurring.getFrequency())
                .startDate(recurring.getStartDate())
                .endDate(recurring.getEndDate())
                .nextOccurrence(recurring.getNextOccurrence())
                .dayOfMonth(recurring.getDayOfMonth())
                .dayOfWeek(recurring.getDayOfWeek())
                .transferToAccountId(recurring.getTransferToAccount() != null ? recurring.getTransferToAccount().getId() : null)
                .transferToAccountName(recurring.getTransferToAccount() != null ? recurring.getTransferToAccount().getAccountName() : null)
                .isActive(recurring.getIsActive())
                .autoPost(recurring.getAutoPost())
                .createdAt(recurring.getCreatedAt())
                .updatedAt(recurring.getUpdatedAt())
                .build();
    }
}
