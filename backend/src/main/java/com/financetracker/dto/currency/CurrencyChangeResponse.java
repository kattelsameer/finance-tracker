package com.financetracker.dto.currency;

/**
 * Response returned after a successful currency change operation.
 */
public class CurrencyChangeResponse {

    private String previousCurrency;
    private String newCurrency;
    private String action;
    private int accountsUpdated;
    private int transactionsUpdated;
    private int recurringUpdated;
    private int budgetsUpdated;
    private String message;

    public CurrencyChangeResponse() {
    }

    public CurrencyChangeResponse(String previousCurrency, String newCurrency, String action,
                                   int accountsUpdated, int transactionsUpdated,
                                   int recurringUpdated, int budgetsUpdated, String message) {
        this.previousCurrency = previousCurrency;
        this.newCurrency = newCurrency;
        this.action = action;
        this.accountsUpdated = accountsUpdated;
        this.transactionsUpdated = transactionsUpdated;
        this.recurringUpdated = recurringUpdated;
        this.budgetsUpdated = budgetsUpdated;
        this.message = message;
    }

    public String getPreviousCurrency() { return previousCurrency; }
    public void setPreviousCurrency(String previousCurrency) { this.previousCurrency = previousCurrency; }

    public String getNewCurrency() { return newCurrency; }
    public void setNewCurrency(String newCurrency) { this.newCurrency = newCurrency; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public int getAccountsUpdated() { return accountsUpdated; }
    public void setAccountsUpdated(int accountsUpdated) { this.accountsUpdated = accountsUpdated; }

    public int getTransactionsUpdated() { return transactionsUpdated; }
    public void setTransactionsUpdated(int transactionsUpdated) { this.transactionsUpdated = transactionsUpdated; }

    public int getRecurringUpdated() { return recurringUpdated; }
    public void setRecurringUpdated(int recurringUpdated) { this.recurringUpdated = recurringUpdated; }

    public int getBudgetsUpdated() { return budgetsUpdated; }
    public void setBudgetsUpdated(int budgetsUpdated) { this.budgetsUpdated = budgetsUpdated; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
