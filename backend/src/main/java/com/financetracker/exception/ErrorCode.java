package com.financetracker.exception;

public enum ErrorCode {
    
    // Authentication errors (1000-1099)
    INVALID_CREDENTIALS(1001, "Invalid username or password", 401),
    ACCOUNT_LOCKED(1002, "Account is locked. Please try again later", 423),
    USERNAME_ALREADY_EXISTS(1003, "Username already exists", 409),
    EMAIL_ALREADY_EXISTS(1004, "Email already exists", 409),
    USER_NOT_FOUND(1005, "User not found", 404),
    UNAUTHORIZED(1006, "Unauthorized access", 401),
    TOKEN_EXPIRED(1007, "Token has expired", 401),
    TOKEN_INVALID(1008, "Invalid token", 401),
    
    // Validation errors (2000-2099)
    VALIDATION_FAILED(2001, "Validation failed", 400),
    INVALID_INPUT(2002, "Invalid input provided", 400),
    MISSING_REQUIRED_FIELD(2003, "Required field is missing", 400),
    
    // Resource errors (3000-3099)
    RESOURCE_NOT_FOUND(3001, "Resource not found", 404),
    ACCOUNT_NOT_FOUND(3002, "Account not found", 404),
    CATEGORY_NOT_FOUND(3003, "Category not found", 404),
    TRANSACTION_NOT_FOUND(3004, "Transaction not found", 404),
    BUDGET_NOT_FOUND(3005, "Budget not found", 404),
    TAG_NOT_FOUND(3006, "Tag not found", 404),
    RECURRING_TRANSACTION_NOT_FOUND(3007, "Recurring transaction not found", 404),
    CURRENCY_NOT_FOUND(3008, "Currency not found", 404),
    
    // Business logic errors (4000-4099)
    INSUFFICIENT_BALANCE(4001, "Insufficient account balance", 400),
    DUPLICATE_RESOURCE(4002, "Resource already exists", 409),
    OPERATION_NOT_ALLOWED(4003, "Operation not allowed", 403),
    INVALID_TRANSFER(4004, "Invalid transfer - source and destination accounts must be different", 400),
    INVALID_TRANSFER_TRANSACTION(4004, "Transfer transaction requires transferToAccountId", 400),
    BUDGET_EXCEEDED(4005, "Budget limit exceeded", 400),
    TAG_ALREADY_EXISTS(4006, "Tag with this name already exists", 409),
    INVALID_DATE_RANGE(4007, "End date must be after start date", 400),
    ACCOUNT_TYPE_NOT_FOUND(4008, "Account type not found", 404),
    INVALID_CATEGORY_TYPE(4009, "Invalid category type for this transaction", 400),
    INVALID_OPERATION(4010, "Invalid operation", 400),
    
    // Server errors (5000-5099)
    INTERNAL_ERROR(5001, "An internal error occurred", 500),
    DATABASE_ERROR(5002, "Database error occurred", 500),
    EXTERNAL_SERVICE_ERROR(5003, "External service error", 503),
    EXTERNAL_API_ERROR(5004, "External API error", 503);
    
    private final int code;
    private final String message;
    private final int httpStatus;
    
    ErrorCode(int code, String message, int httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
    
    public int getCode() {
        return code;
    }
    
    public String getMessage() {
        return message;
    }
    
    public int getHttpStatus() {
        return httpStatus;
    }
}
