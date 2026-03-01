package com.financetracker.service;

import com.financetracker.dto.account.*;
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
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private AccountTypeRepository accountTypeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AccountService accountService;

    private User testUser;
    private AccountType testAccountType;
    private Account testAccount;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");

        testAccountType = new AccountType();
        testAccountType.setId(1);
        testAccountType.setTypeName("Checking");
        testAccountType.setTypeCode("CHECKING");

        testAccount = new Account();
        testAccount.setId(1L);
        testAccount.setUser(testUser);
        testAccount.setAccountName("Test Account");
        testAccount.setAccountType(testAccountType);
        testAccount.setCurrency("USD");
        testAccount.setCurrentBalance(BigDecimal.ZERO);
    }

    @Test
    void createAccount_Success() {
        CreateAccountRequest request = new CreateAccountRequest();
        request.setAccountName("New Account");
        request.setAccountTypeId(1);
        request.setCurrency("USD");
        request.setInitialBalance(BigDecimal.valueOf(1000));

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(accountTypeRepository.findById(1)).thenReturn(Optional.of(testAccountType));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        AccountResponse response = accountService.createAccount(1L, request);

        assertThat(response).isNotNull();
        assertThat(response.getAccountName()).isEqualTo("Test Account");
        verify(accountRepository, times(1)).save(any(Account.class));
    }

    @Test
    void createAccount_InvalidAccountType_ThrowsException() {
        CreateAccountRequest request = new CreateAccountRequest();
        request.setAccountName("New Account");
        request.setAccountTypeId(999);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(accountTypeRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.createAccount(1L, request))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void getAccount_Success() {
        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testAccount));

        AccountResponse response = accountService.getAccount(1L, 1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        verify(accountRepository, times(1)).findByIdAndUserId(1L, 1L);
    }

    @Test
    void getAccount_NotFound_ThrowsException() {
        when(accountRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.getAccount(1L, 999L))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void updateAccount_Success() {
        UpdateAccountRequest request = new UpdateAccountRequest();
        request.setAccountName("Updated Account");

        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        AccountResponse response = accountService.updateAccount(1L, 1L, request);

        assertThat(response).isNotNull();
        verify(accountRepository, times(1)).save(any(Account.class));
    }

    @Test
    void deleteAccount_Success() {
        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        assertThatCode(() -> accountService.deleteAccount(1L, 1L))
                .doesNotThrowAnyException();

        verify(accountRepository, times(1)).save(any(Account.class));
    }

    @Test
    void getAllAccounts_Success() {
        List<Account> accounts = Arrays.asList(testAccount);
        when(accountRepository.findByUserIdOrderByAccountNameAsc(1L)).thenReturn(accounts);

        List<AccountResponse> response = accountService.getAllAccounts(1L);

        assertThat(response).isNotNull();
        assertThat(response).hasSize(1);
        verify(accountRepository, times(1)).findByUserIdOrderByAccountNameAsc(1L);
    }
}
