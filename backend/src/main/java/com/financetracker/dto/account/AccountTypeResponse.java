package com.financetracker.dto.account;

public class AccountTypeResponse {
    
    private Integer id;
    private String typeCode;
    private String typeName;
    private Boolean isLiability;
    private Integer displayOrder;
    
    public AccountTypeResponse() {
    }
    
    public AccountTypeResponse(Integer id, String typeCode, String typeName, 
                                Boolean isLiability, Integer displayOrder) {
        this.id = id;
        this.typeCode = typeCode;
        this.typeName = typeName;
        this.isLiability = isLiability;
        this.displayOrder = displayOrder;
    }
    
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getTypeCode() {
        return typeCode;
    }
    
    public void setTypeCode(String typeCode) {
        this.typeCode = typeCode;
    }
    
    public String getTypeName() {
        return typeName;
    }
    
    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }
    
    public Boolean getIsLiability() {
        return isLiability;
    }
    
    public void setIsLiability(Boolean isLiability) {
        this.isLiability = isLiability;
    }
    
    public Integer getDisplayOrder() {
        return displayOrder;
    }
    
    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
