package com.financetracker.exception;

public class ApiException extends RuntimeException {
    
    private final ErrorCode errorCode;
    private final String details;
    
    public ApiException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.details = null;
    }
    
    public ApiException(ErrorCode errorCode, String details) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.details = details;
    }
    
    public ApiException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
        this.details = null;
    }
    
    public ApiException(ErrorCode errorCode, String details, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
        this.details = details;
    }
    
    public ErrorCode getErrorCode() {
        return errorCode;
    }
    
    public String getDetails() {
        return details;
    }
    
    public int getHttpStatus() {
        return errorCode.getHttpStatus();
    }
}
