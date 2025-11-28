package com.financetracker.controller;

import com.financetracker.dto.importexport.ImportResult;
import com.financetracker.security.UserPrincipal;
import com.financetracker.service.ImportExportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/import-export")
public class ImportExportController {
    
    private final ImportExportService importExportService;
    
    public ImportExportController(ImportExportService importExportService) {
        this.importExportService = importExportService;
    }
    
    @PostMapping("/import/csv")
    public ResponseEntity<ImportResult> importTransactions(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("file") MultipartFile file) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ImportResult.withErrors(0, 0, 0, 1));
        }
        
        try {
            ImportResult result = importExportService.importTransactionsFromCSV(
                    userPrincipal.getId(), file);
            return ResponseEntity.status(HttpStatus.OK).body(result);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ImportResult.withErrors(0, 0, 0, 1));
        }
    }
    
    @GetMapping("/export/csv")
    public ResponseEntity<String> exportTransactions(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            String csv = importExportService.exportTransactionsToCSV(
                    userPrincipal.getId(), startDate, endDate);
            
            String filename = String.format("transactions_%s_to_%s.csv",
                    startDate.format(DateTimeFormatter.ISO_DATE),
                    endDate.format(DateTimeFormatter.ISO_DATE));
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csv);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
