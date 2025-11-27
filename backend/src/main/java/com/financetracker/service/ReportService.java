package com.financetracker.service;

import com.financetracker.dto.report.TransactionReportResponse;
import com.financetracker.dto.report.TransactionReportResponse.*;
import com.financetracker.entity.Transaction;
import com.financetracker.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {
    
    private final TransactionRepository transactionRepository;
    
    public ReportService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }
    
    @Transactional(readOnly = true)
    public TransactionReportResponse generateTransactionReport(Long userId, LocalDate startDate, LocalDate endDate,
                                                                Long accountId, Long categoryId) {
        TransactionReportResponse report = new TransactionReportResponse();
        report.setStartDate(startDate);
        report.setEndDate(endDate);
        
        // Get transactions based on filters
        List<Transaction> transactions;
        if (accountId != null && categoryId != null) {
            transactions = transactionRepository.findByUserIdAndCategoryIdAndTransactionDateBetween(
                    userId, categoryId, startDate, endDate).stream()
                    .filter(t -> t.getAccount().getId().equals(accountId))
                    .collect(Collectors.toList());
        } else if (accountId != null) {
            transactions = transactionRepository.findByAccountAndDateRange(userId, accountId, startDate, endDate);
        } else if (categoryId != null) {
            transactions = transactionRepository.findByUserIdAndCategoryIdAndTransactionDateBetween(
                    userId, categoryId, startDate, endDate);
        } else {
            transactions = transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                    userId, startDate, endDate);
        }
        
        // Calculate totals
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getTransactionType() == Transaction.TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalExpenses = transactions.stream()
                .filter(t -> t.getTransactionType() == Transaction.TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        report.setTotalIncome(totalIncome);
        report.setTotalExpenses(totalExpenses);
        report.setNetAmount(totalIncome.subtract(totalExpenses));
        report.setTransactionCount(transactions.size());
        
        // Category breakdown
        report.setCategoryBreakdown(generateCategoryBreakdown(transactions, totalIncome, totalExpenses));
        
        // Account breakdown
        report.setAccountBreakdown(generateAccountBreakdown(transactions));
        
        // Daily breakdown
        report.setDailyBreakdown(generateDailyBreakdown(transactions, startDate, endDate));
        
        return report;
    }
    
    private List<CategoryBreakdown> generateCategoryBreakdown(List<Transaction> transactions,
                                                                BigDecimal totalIncome,
                                                                BigDecimal totalExpenses) {
        Map<String, List<Transaction>> byCategory = transactions.stream()
                .filter(t -> t.getCategory() != null)
                .collect(Collectors.groupingBy(t -> t.getCategory().getId() + "-" + 
                        t.getCategory().getCategoryName() + "-" + 
                        t.getTransactionType()));
        
        return byCategory.entrySet().stream()
                .map(entry -> {
                    String[] keys = entry.getKey().split("-");
                    Long categoryId = Long.parseLong(keys[0]);
                    String categoryName = keys[1];
                    Transaction.TransactionType type = Transaction.TransactionType.valueOf(keys[2]);
                    
                    List<Transaction> categoryTxs = entry.getValue();
                    BigDecimal amount = categoryTxs.stream()
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    CategoryBreakdown breakdown = new CategoryBreakdown(
                            categoryId, categoryName, type, amount, categoryTxs.size());
                    
                    // Calculate percentage
                    BigDecimal total = type == Transaction.TransactionType.INCOME ? totalIncome : totalExpenses;
                    if (total.compareTo(BigDecimal.ZERO) > 0) {
                        double percentage = amount.divide(total, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
                                .doubleValue();
                        breakdown.setPercentage(percentage);
                    }
                    
                    return breakdown;
                })
                .sorted((a, b) -> b.getAmount().compareTo(a.getAmount()))
                .collect(Collectors.toList());
    }
    
    private List<AccountBreakdown> generateAccountBreakdown(List<Transaction> transactions) {
        Map<Long, List<Transaction>> byAccount = transactions.stream()
                .collect(Collectors.groupingBy(t -> t.getAccount().getId()));
        
        return byAccount.entrySet().stream()
                .map(entry -> {
                    List<Transaction> accountTxs = entry.getValue();
                    
                    BigDecimal income = accountTxs.stream()
                            .filter(t -> t.getTransactionType() == Transaction.TransactionType.INCOME)
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    BigDecimal expenses = accountTxs.stream()
                            .filter(t -> t.getTransactionType() == Transaction.TransactionType.EXPENSE)
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    AccountBreakdown breakdown = new AccountBreakdown();
                    breakdown.setAccountId(entry.getKey());
                    breakdown.setAccountName(accountTxs.get(0).getAccount().getAccountName());
                    breakdown.setIncome(income);
                    breakdown.setExpenses(expenses);
                    breakdown.setNetAmount(income.subtract(expenses));
                    breakdown.setTransactionCount(accountTxs.size());
                    
                    return breakdown;
                })
                .sorted((a, b) -> b.getTransactionCount().compareTo(a.getTransactionCount()))
                .collect(Collectors.toList());
    }
    
    private List<DailyBreakdown> generateDailyBreakdown(List<Transaction> transactions,
                                                          LocalDate startDate, LocalDate endDate) {
        Map<LocalDate, List<Transaction>> byDate = transactions.stream()
                .collect(Collectors.groupingBy(Transaction::getTransactionDate));
        
        List<DailyBreakdown> dailyBreakdowns = new ArrayList<>();
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            List<Transaction> dayTxs = byDate.getOrDefault(date, List.of());
            
            BigDecimal income = dayTxs.stream()
                    .filter(t -> t.getTransactionType() == Transaction.TransactionType.INCOME)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal expenses = dayTxs.stream()
                    .filter(t -> t.getTransactionType() == Transaction.TransactionType.EXPENSE)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            dailyBreakdowns.add(new DailyBreakdown(date, income, expenses));
        }
        
        return dailyBreakdowns;
    }
    
    public String generateCSVReport(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository
                .findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(userId, startDate, endDate);
        
        StringBuilder csv = new StringBuilder();
        csv.append("Date,Type,Account,Category,Amount,Description\n");
        
        transactions.forEach(tx -> {
            csv.append(tx.getTransactionDate()).append(",");
            csv.append(tx.getTransactionType()).append(",");
            csv.append(tx.getAccount().getAccountName()).append(",");
            csv.append(tx.getCategory() != null ? tx.getCategory().getCategoryName() : "").append(",");
            csv.append(tx.getAmount()).append(",");
            csv.append(tx.getDescription() != null ? "\"" + tx.getDescription().replace("\"", "\"\"") + "\"" : "");
            csv.append("\n");
        });
        
        return csv.toString();
    }
}
