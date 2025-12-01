package com.financetracker.exception;

/**
 * Exception thrown when token hashing operations fail.
 * This is a more specific exception than RuntimeException for security-related operations.
 */
public class TokenHashingException extends RuntimeException {
    
    public TokenHashingException(String message) {
        super(message);
    }
    
    public TokenHashingException(String message, Throwable cause) {
        super(message, cause);
    }
}
