package com.financetracker.service;

import com.financetracker.dto.transaction.*;
import com.financetracker.entity.*;
import com.financetracker.exception.ApiException;
import com.financetracker.repository.*;
import com.financetracker.specification.TransactionSpecification;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TransactionService transactionService;

    private User testUser;
    private Account testAccount;
    private Category testCategory;
    private Transaction testTransaction;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");

        testAccount = new Account();
        testAccount.setId(1L);
        testAccount.setUser(testUser);
        testAccount.setAccountName("Test Account");
        testAccount.setCurrentBalance(BigDecimal.valueOf(1000));

        testCategory = new Category();
        testCategory.setId(1L);
        testCategory.setUser(testUser);
        testCategory.setCategoryName("Test Category");
        testCategory.setCategoryType(Category.CategoryType.EXPENSE);

        testTransaction = new Transaction();
        testTransaction.setId(1L);
        testTransaction.setUser(testUser);
        testTransaction.setAccount(testAccount);
        testTransaction.setCategory(testCategory);
        testTransaction.setAmount(BigDecimal.valueOf(100));
        testTransaction.setTransactionDate(LocalDate.now());
        testTransaction.setTransactionType(Transaction.TransactionType.EXPENSE);
        testTransaction.setDescription("Test transaction");
    }

    @Test
    void createTransaction_Success() {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setAccountId(1L);
        request.setCategoryId(1L);
        request.setAmount(BigDecimal.valueOf(100));
        request.setTransactionDate(LocalDate.now());
        request.setTransactionType(Transaction.TransactionType.EXPENSE);
        request.setDescription("Test");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testAccount));
        when(categoryRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testCategory));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);

        TransactionResponse response = transactionService.createTransaction(1L, request);

        assertThat(response).isNotNull();
        assertThat(response.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(100));
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void createTransaction_AccountNotFound_ThrowsException() {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setAccountId(999L);
        request.setCategoryId(1L);
        request.setAmount(BigDecimal.valueOf(100));

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(accountRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.createTransaction(1L, request))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void getTransaction_Success() {
        when(transactionRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testTransaction));

        TransactionResponse response = transactionService.getTransaction(1L, 1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        verify(transactionRepository, times(1)).findByIdAndUserId(1L, 1L);
    }

    @Test
    void getTransaction_NotFound_ThrowsException() {
        when(transactionRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.getTransaction(1L, 999L))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void updateTransaction_Success() {
        UpdateTransactionRequest request = new UpdateTransactionRequest();
        request.setAmount(BigDecimal.valueOf(200));
        request.setDescription("Updated");

        when(transactionRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testTransaction));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);

        TransactionResponse response = transactionService.updateTransaction(1L, 1L, request);

        assertThat(response).isNotNull();
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void deleteTransaction_Success() {
        when(transactionRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testTransaction));
        doNothing().when(transactionRepository).delete(any(Transaction.class));

        assertThatCode(() -> transactionService.deleteTransaction(1L, 1L))
                .doesNotThrowAnyException();

        verify(transactionRepository, times(1)).delete(any(Transaction.class));
    }

    @Test
    void getTransactions_WithPagination() {
        List<Transaction> transactions = Arrays.asList(testTransaction);
        Page<Transaction> page = new PageImpl<>(transactions);
        
        TransactionFilter filter = new TransactionFilter();
        Pageable pageable = PageRequest.of(0, 10);

        when(transactionRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

        Page<TransactionResponse> result = transactionService.getTransactions(1L, filter, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(transactionRepository, times(1)).findAll(any(Specification.class), eq(pageable));
    }
}
