package com.financetracker.service;

import com.financetracker.dto.importexport.ImportResult;
import com.financetracker.dto.importexport.TransactionImportRecord;
import com.financetracker.entity.*;
import com.financetracker.exception.ApiException;
import com.financetracker.exception.ErrorCode;
import com.financetracker.repository.*;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ImportExportService {
    
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    
    private static final DateTimeFormatter[] DATE_FORMATTERS = {
            DateTimeFormatter.ISO_LOCAL_DATE,           // 2024-01-15
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),  // 01/15/2024
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),  // 15/01/2024
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),  // 2024-01-15
            DateTimeFormatter.ofPattern("M/d/yyyy"),    // 1/15/2024
            DateTimeFormatter.ofPattern("d/M/yyyy")     // 15/1/2024
    };
    
    public ImportExportService(
            TransactionRepository transactionRepository,
            UserRepository userRepository,
            AccountRepository accountRepository,
            CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
    }
    
    public ImportResult importTransactionsFromCSV(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        
        List<TransactionImportRecord> records = parseCSV(file);
        
        int totalRecords = records.size();
        int successful = 0;
        int duplicates = 0;
        int errors = 0;
        
        Set<String> existingKeys = getExistingTransactionKeys(userId);
        
        for (TransactionImportRecord record : records) {
            try {
                String uniqueKey = record.generateUniqueKey();
                
                // Skip duplicates
                if (existingKeys.contains(uniqueKey)) {
                    duplicates++;
                    continue;
                }
                
                Transaction transaction = createTransactionFromRecord(user, record);
                transactionRepository.save(transaction);
                existingKeys.add(uniqueKey);
                successful++;
                
            } catch (Exception e) {
                errors++;
                System.err.println("Error importing record: " + e.getMessage());
            }
        }
        
        if (errors > 0) {
            return ImportResult.withErrors(totalRecords, successful, duplicates, errors);
        }
        return ImportResult.success(totalRecords, successful, duplicates);
    }
    
    private List<TransactionImportRecord> parseCSV(MultipartFile file) throws IOException {
        List<TransactionImportRecord> records = new ArrayList<>();
        
        try (Reader reader = new InputStreamReader(file.getInputStream());
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT
                     .withFirstRecordAsHeader()
                     .withIgnoreHeaderCase()
                     .withTrim())) {
            
            for (CSVRecord csvRecord : csvParser) {
                TransactionImportRecord record = TransactionImportRecord.builder()
                        .date(parseDate(getColumnValue(csvRecord, "Date", "date", "Transaction Date")))
                        .description(getColumnValue(csvRecord, "Description", "description", "Details"))
                        .amount(parseAmount(getColumnValue(csvRecord, "Amount", "amount")))
                        .type(parseTransactionType(getColumnValue(csvRecord, "Type", "type", "Transaction Type")))
                        .accountName(getColumnValue(csvRecord, "Account", "account", "Account Name"))
                        .categoryName(getColumnValue(csvRecord, "Category", "category"))
                        .notes(getColumnValue(csvRecord, "Notes", "notes", "Memo"))
                        .referenceNumber(getColumnValue(csvRecord, "Reference", "reference", "Ref"))
                        .build();
                
                records.add(record);
            }
        }
        
        return records;
    }
    
    private String getColumnValue(CSVRecord record, String... possibleNames) {
        for (String name : possibleNames) {
            try {
                if (record.isMapped(name)) {
                    String value = record.get(name);
                    if (value != null && !value.trim().isEmpty()) {
                        return value.trim();
                    }
                }
            } catch (IllegalArgumentException ignored) {
                // Column doesn't exist, try next name
            }
        }
        return null;
    }
    
    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) {
            return LocalDate.now();
        }
        
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(dateStr, formatter);
            } catch (DateTimeParseException ignored) {
                // Try next formatter
            }
        }
        
        throw new IllegalArgumentException("Unable to parse date: " + dateStr);
    }
    
    private BigDecimal parseAmount(String amountStr) {
        if (amountStr == null || amountStr.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        // Remove currency symbols and commas
        String cleaned = amountStr.replaceAll("[^0-9.-]", "");
        return new BigDecimal(cleaned);
    }
    
    private Transaction.TransactionType parseTransactionType(String typeStr) {
        if (typeStr == null || typeStr.isEmpty()) {
            return Transaction.TransactionType.EXPENSE;
        }
        
        String normalized = typeStr.toUpperCase().trim();
        
        if (normalized.contains("INCOME") || normalized.contains("CREDIT") || normalized.contains("DEPOSIT")) {
            return Transaction.TransactionType.INCOME;
        } else if (normalized.contains("TRANSFER")) {
            return Transaction.TransactionType.TRANSFER;
        }
        
        return Transaction.TransactionType.EXPENSE;
    }
    
    private Set<String> getExistingTransactionKeys(Long userId) {
        Page<Transaction> transactionPage = transactionRepository.findByUserId(userId, Pageable.unpaged());
        List<Transaction> existingTransactions = transactionPage.getContent();
        
        return existingTransactions.stream()
                .map(t -> String.format("%s_%s_%s_%s",
                        t.getTransactionDate() != null ? t.getTransactionDate().toString() : "",
                        t.getDescription() != null ? t.getDescription() : "",
                        t.getAmount() != null ? t.getAmount().toString() : "",
                        t.getAccount() != null ? t.getAccount().getAccountName() : ""
                ))
                .collect(Collectors.toSet());
    }
    
    private Transaction createTransactionFromRecord(User user, TransactionImportRecord record) {
        // Find or use default account
        Account account = findOrCreateAccount(user, record.getAccountName());
        
        // Find category if specified
        Category category = null;
        if (record.getCategoryName() != null) {
            category = findCategoryByName(user.getId(), record.getCategoryName());
        }
        
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAccount(account);
        transaction.setCategory(category);
        transaction.setTransactionType(record.getType());
        transaction.setAmount(record.getAmount());
        transaction.setCurrency("USD");
        transaction.setTransactionDate(record.getDate());
        transaction.setDescription(record.getDescription());
        transaction.setNotes(record.getNotes());
        transaction.setReferenceNumber(record.getReferenceNumber());
        transaction.setIsRecurring(false);
        
        return transaction;
    }
    
    private Account findOrCreateAccount(User user, String accountName) {
        if (accountName == null || accountName.isEmpty()) {
            // Get first active account or create default
            List<Account> accounts = accountRepository.findByUserIdAndIsActiveOrderByAccountNameAsc(user.getId(), true);
            if (!accounts.isEmpty()) {
                return accounts.get(0);
            }
            throw new ApiException(ErrorCode.ACCOUNT_NOT_FOUND);
        }
        
        List<Account> accounts = accountRepository.findByUserIdOrderByAccountNameAsc(user.getId());
        return accounts.stream()
                .filter(a -> a.getAccountName().equalsIgnoreCase(accountName))
                .findFirst()
                .orElseThrow(() -> new ApiException(ErrorCode.ACCOUNT_NOT_FOUND));
    }
    
    private Category findCategoryByName(Long userId, String categoryName) {
        // Fetch all categories and find by name
        List<Category> categories = categoryRepository.findAll().stream()
                .filter(c -> c.getUser() != null && c.getUser().getId().equals(userId))
                .toList();
        return categories.stream()
                .filter(c -> c.getCategoryName().equalsIgnoreCase(categoryName))
                .findFirst()
                .orElse(null);
    }
    
    @Transactional(readOnly = true)
    public String exportTransactionsToCSV(Long userId, LocalDate startDate, LocalDate endDate) throws IOException {
        List<Transaction> transactions = transactionRepository
                .findByUserIdAndTransactionDateBetween(userId, startDate, endDate);
        
        StringWriter writer = new StringWriter();
        try (CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT
                .withHeader("Date", "Description", "Amount", "Type", "Account", "Category", "Notes", "Reference"))) {
            
            for (Transaction transaction : transactions) {
                csvPrinter.printRecord(
                        transaction.getTransactionDate(),
                        transaction.getDescription(),
                        transaction.getAmount(),
                        transaction.getTransactionType(),
                        transaction.getAccount().getAccountName(),
                        transaction.getCategory() != null ? transaction.getCategory().getCategoryName() : "",
                        transaction.getNotes(),
                        transaction.getReferenceNumber()
                );
            }
        }
        
        return writer.toString();
    }
}
