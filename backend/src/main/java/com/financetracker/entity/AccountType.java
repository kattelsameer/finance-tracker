package com.financetracker.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "account_types")
public class AccountType {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "type_code", nullable = false, unique = true, length = 20)
    private String typeCode;
    
    @Column(name = "type_name", nullable = false, length = 50)
    private String typeName;
    
    @Column(name = "is_liability")
    private Boolean isLiability = false;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    public AccountType() {
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
