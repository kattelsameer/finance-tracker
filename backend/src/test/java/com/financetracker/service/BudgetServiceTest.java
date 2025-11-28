package com.financetracker.service;

import com.financetracker.dto.budget.*;
import com.financetracker.entity.*;
import com.financetracker.exception.ApiException;
import com.financetracker.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private BudgetService budgetService;

    private User testUser;
    private Category testCategory;
    private Budget testBudget;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");

        testCategory = new Category();
        testCategory.setId(1L);
        testCategory.setUser(testUser);
        testCategory.setCategoryName("Groceries");
        testCategory.setCategoryType(Category.CategoryType.EXPENSE);

        testBudget = new Budget();
        testBudget.setId(1L);
        testBudget.setUser(testUser);
        testBudget.setCategory(testCategory);
        testBudget.setAmount(BigDecimal.valueOf(500));
        testBudget.setPeriodType(Budget.PeriodType.MONTHLY);
        testBudget.setStartDate(LocalDate.now().withDayOfMonth(1));
        testBudget.setEndDate(LocalDate.now().withDayOfMonth(1).plusMonths(1).minusDays(1));
    }

    @Test
    void createBudget_Success() {
        CreateBudgetRequest request = new CreateBudgetRequest();
        request.setCategoryId(1L);
        request.setAmount(BigDecimal.valueOf(500));
        request.setPeriodType(Budget.PeriodType.MONTHLY);
        request.setStartDate(LocalDate.now().withDayOfMonth(1));

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(categoryRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testCategory));
        when(budgetRepository.save(any(Budget.class))).thenReturn(testBudget);

        BudgetResponse response = budgetService.createBudget(1L, request);

        assertThat(response).isNotNull();
        assertThat(response.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(500));
        verify(budgetRepository, times(1)).save(any(Budget.class));
    }

    @Test
    void createBudget_CategoryNotFound_ThrowsException() {
        CreateBudgetRequest request = new CreateBudgetRequest();
        request.setCategoryId(999L);
        request.setAmount(BigDecimal.valueOf(500));

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(categoryRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> budgetService.createBudget(1L, request))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void getBudget_Success() {
        when(budgetRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testBudget));

        BudgetResponse response = budgetService.getBudgetById(1L, 1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        verify(budgetRepository, times(1)).findByIdAndUserId(1L, 1L);
    }

    @Test
    void getBudget_NotFound_ThrowsException() {
        when(budgetRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> budgetService.getBudgetById(1L, 999L))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void updateBudget_Success() {
        UpdateBudgetRequest request = new UpdateBudgetRequest();
        request.setAmount(BigDecimal.valueOf(600));

        when(budgetRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testBudget));
        when(budgetRepository.save(any(Budget.class))).thenReturn(testBudget);

        BudgetResponse response = budgetService.updateBudget(1L, 1L, request);

        assertThat(response).isNotNull();
        verify(budgetRepository, times(1)).save(any(Budget.class));
    }

    @Test
    void deleteBudget_Success() {
        when(budgetRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testBudget));
        doNothing().when(budgetRepository).delete(any(Budget.class));

        assertThatCode(() -> budgetService.deleteBudget(1L, 1L))
                .doesNotThrowAnyException();

        verify(budgetRepository, times(1)).delete(any(Budget.class));
    }

    @Test
    void getAllBudgets_Success() {
        List<Budget> budgets = Arrays.asList(testBudget);
        when(budgetRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(budgets);

        List<BudgetResponse> response = budgetService.getAllBudgetsForUser(1L);

        assertThat(response).isNotNull();
        assertThat(response).hasSize(1);
        verify(budgetRepository, times(1)).findByUserIdOrderByCreatedAtDesc(1L);
    }
}
