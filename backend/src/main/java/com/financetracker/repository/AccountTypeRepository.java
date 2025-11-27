package com.financetracker.repository;

import com.financetracker.entity.AccountType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountTypeRepository extends JpaRepository<AccountType, Integer> {
    
    Optional<AccountType> findByTypeCode(String typeCode);
    
    List<AccountType> findAllByOrderByDisplayOrderAsc();
}
