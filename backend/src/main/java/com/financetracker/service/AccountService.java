package com.financetracker.service;

import com.financetracker.dto.account.*;
import com.financetracker.entity.Account;
import com.financetracker.entity.AccountType;
import com.financetracker.entity.User;
import com.financetracker.exception.ApiException;
import com.financetracker.exception.ErrorCode;
import com.financetracker.repository.AccountRepository;
import com.financetracker.repository.AccountTypeRepository;
import com.financetracker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import org.springframework.lang.NonNull;
import java.util.stream.Collectors;

@Service
public class AccountService {
    
    private static final Logger logger = LoggerFactory.getLogger(AccountService.class);
    
    private final AccountRepository accountRepository;
    private final AccountTypeRepository accountTypeRepository;
    private final UserRepository userRepository;
    
    public AccountService(AccountRepository accountRepository,
                          AccountTypeRepository accountTypeRepository,
                          UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.accountTypeRepository = accountTypeRepository;
        this.userRepository = userRepository;
    }
    
    @Transactional
    public AccountResponse createAccount(@NonNull Long userId, @NonNull CreateAccountRequest request) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        AccountType accountType = accountTypeRepository.findById(Objects.requireNonNull(request.getAccountTypeId()))
            .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Account type not found"));
        
        Account account = new Account();
        account.setUser(user);
        account.setAccountType(accountType);
        account.setAccountName(request.getAccountName());
        account.setCurrency(request.getCurrency());
        account.setInitialBalance(request.getInitialBalance());
        account.setCurrentBalance(request.getInitialBalance());
        account.setInstitutionName(request.getInstitutionName());
        account.setAccountNumberMasked(request.getAccountNumberMasked());
        account.setColorCode(request.getColorCode());
        account.setIcon(request.getIcon());
        account.setIncludeInNetWorth(request.getIncludeInNetWorth());
        account.setNotes(request.getNotes());
        
        account = accountRepository.save(Objects.requireNonNull(account));
        
        logger.info("Account created: {} for user: {}", account.getId(), userId);
        
        return mapToResponse(account);
    }
    
    @Transactional(readOnly = true)
    public List<AccountResponse> getAllAccounts(@NonNull Long userId) {
        return accountRepository.findByUserIdOrderByAccountNameAsc(Objects.requireNonNull(userId))
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<AccountResponse> getActiveAccounts(@NonNull Long userId) {
        return accountRepository.findByUserIdAndIsActiveOrderByAccountNameAsc(Objects.requireNonNull(userId), true)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public AccountResponse getAccount(@NonNull Long userId, @NonNull Long accountId) {
        Account account = accountRepository.findByIdAndUserId(Objects.requireNonNull(accountId), Objects.requireNonNull(userId))
                .orElseThrow(() -> new ApiException(ErrorCode.ACCOUNT_NOT_FOUND));
        return mapToResponse(account);
    }
    
    @Transactional
    public AccountResponse updateAccount(@NonNull Long userId, @NonNull Long accountId, @NonNull UpdateAccountRequest request) {
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.ACCOUNT_NOT_FOUND));
        
        if (request.getAccountTypeId() != null) {
            AccountType accountType = accountTypeRepository.findById(Objects.requireNonNull(request.getAccountTypeId()))
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Account type not found"));
            account.setAccountType(accountType);
        }
        
        if (request.getAccountName() != null) {
            account.setAccountName(request.getAccountName());
        }
        if (request.getCurrency() != null) {
            account.setCurrency(request.getCurrency());
        }
        if (request.getInstitutionName() != null) {
            account.setInstitutionName(request.getInstitutionName());
        }
        if (request.getAccountNumberMasked() != null) {
            account.setAccountNumberMasked(request.getAccountNumberMasked());
        }
        if (request.getColorCode() != null) {
            account.setColorCode(request.getColorCode());
        }
        if (request.getIcon() != null) {
            account.setIcon(request.getIcon());
        }
        if (request.getIsActive() != null) {
            account.setIsActive(request.getIsActive());
        }
        if (request.getIncludeInNetWorth() != null) {
            account.setIncludeInNetWorth(request.getIncludeInNetWorth());
        }
        if (request.getNotes() != null) {
            account.setNotes(request.getNotes());
        }
        
        account = accountRepository.save(Objects.requireNonNull(account));
        
        logger.info("Account updated: {} for user: {}", accountId, userId);
        
        return mapToResponse(account);
    }
    
    @Transactional
    public void deleteAccount(@NonNull Long userId, @NonNull Long accountId) {
        Account account = accountRepository.findByIdAndUserId(Objects.requireNonNull(accountId), Objects.requireNonNull(userId))
                .orElseThrow(() -> new ApiException(ErrorCode.ACCOUNT_NOT_FOUND));
        // Soft delete - just mark as inactive
        account.setIsActive(false);
        accountRepository.save(Objects.requireNonNull(account));
        logger.info("Account soft deleted: {} for user: {}", accountId, userId);
    }
    
    @Transactional
    public void hardDeleteAccount(@NonNull Long userId, @NonNull Long accountId) {
        if (!accountRepository.existsByIdAndUserId(accountId, userId)) {
            throw new ApiException(ErrorCode.ACCOUNT_NOT_FOUND);
        }
        
        accountRepository.deleteById(Objects.requireNonNull(accountId));
        
        logger.info("Account hard deleted: {} for user: {}", accountId, userId);
    }
    
    @Transactional(readOnly = true)
    public BigDecimal getNetWorth(@NonNull Long userId) {
        BigDecimal netWorth = accountRepository.calculateNetWorth(Objects.requireNonNull(userId));
        return netWorth != null ? netWorth : BigDecimal.ZERO;
    }
    
    @Transactional(readOnly = true)
    public List<AccountTypeResponse> getAllAccountTypes() {
        return accountTypeRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(this::mapToTypeResponse)
                .collect(Collectors.toList());
    }
    
    private AccountResponse mapToResponse(Account account) {
        AccountResponse response = new AccountResponse();
        response.setId(account.getId());
        response.setAccountType(mapToTypeResponse(account.getAccountType()));
        response.setAccountName(account.getAccountName());
        response.setCurrency(account.getCurrency());
        response.setInitialBalance(account.getInitialBalance());
        response.setCurrentBalance(account.getCurrentBalance());
        response.setInstitutionName(account.getInstitutionName());
        response.setAccountNumberMasked(account.getAccountNumberMasked());
        response.setColorCode(account.getColorCode());
        response.setIcon(account.getIcon());
        response.setIsActive(account.getIsActive());
        response.setIncludeInNetWorth(account.getIncludeInNetWorth());
        response.setNotes(account.getNotes());
        response.setCreatedAt(account.getCreatedAt());
        response.setUpdatedAt(account.getUpdatedAt());
        return response;
    }
    
    private AccountTypeResponse mapToTypeResponse(AccountType type) {
        return new AccountTypeResponse(
                type.getId(),
                type.getTypeCode(),
                type.getTypeName(),
                type.getIsLiability(),
                type.getDisplayOrder()
        );
    }
}
