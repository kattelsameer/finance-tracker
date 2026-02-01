package com.financetracker.dto.account;

import jakarta.validation.constraints.*;

public class UpdateAccountRequest {
    
    private Integer accountTypeId;
    
    @Size(min = 1, max = 100, message = "Account name must be between 1 and 100 characters")
    private String accountName;
    
    @Size(min = 3, max = 3, message = "Currency must be a 3-letter code")
    private String currency;
    
    @Size(max = 100, message = "Institution name must be less than 100 characters")
    private String institutionName;
    
    @Size(max = 20, message = "Account number must be less than 20 characters")
    private String accountNumberMasked;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color code must be a valid hex color (e.g., #6366f1)")
    private String colorCode;
    
    @Size(max = 50, message = "Icon name must be less than 50 characters")
    private String icon;
    
    private Boolean isActive;
    
    private Boolean includeInNetWorth;
    
    @Size(max = 1000, message = "Notes must be less than 1000 characters")
    private String notes;
    
    public UpdateAccountRequest() {
    }
    
    public Integer getAccountTypeId() {
        return accountTypeId;
    }
    
    public void setAccountTypeId(Integer accountTypeId) {
        this.accountTypeId = accountTypeId;
    }
    
    public String getAccountName() {
        return accountName;
    }
    
    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public String getInstitutionName() {
        return institutionName;
    }
    
    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }
    
    public String getAccountNumberMasked() {
        return accountNumberMasked;
    }
    
    public void setAccountNumberMasked(String accountNumberMasked) {
        this.accountNumberMasked = accountNumberMasked;
    }
    
    public String getColorCode() {
        return colorCode;
    }
    
    public void setColorCode(String colorCode) {
        this.colorCode = colorCode;
    }
    
    public String getIcon() {
        return icon;
    }
    
    public void setIcon(String icon) {
        this.icon = icon;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Boolean getIncludeInNetWorth() {
        return includeInNetWorth;
    }
    
    public void setIncludeInNetWorth(Boolean includeInNetWorth) {
        this.includeInNetWorth = includeInNetWorth;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}
