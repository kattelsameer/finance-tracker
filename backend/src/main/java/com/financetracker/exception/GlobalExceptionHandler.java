package com.financetracker.exception;

import com.financetracker.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException ex, HttpServletRequest request) {
        ErrorCode errorCode = ex.getErrorCode();
        
        logger.warn("API Exception: {} - {}", errorCode.getCode(), ex.getMessage());
        
        ErrorResponse response = new ErrorResponse(
                errorCode.getCode(),
                errorCode.name(),
                errorCode.getMessage(),
                request.getRequestURI()
        );
        
        if (ex.getDetails() != null) {
            response.setDetails(ex.getDetails());
        }
        
        return ResponseEntity.status(errorCode.getHttpStatus()).body(response);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        List<ErrorResponse.FieldError> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> new ErrorResponse.FieldError(
                        error.getField(),
                        error.getDefaultMessage(),
                        error.getRejectedValue()
                ))
                .collect(Collectors.toList());
        
        ErrorResponse response = new ErrorResponse(
                ErrorCode.VALIDATION_FAILED.getCode(),
                ErrorCode.VALIDATION_FAILED.name(),
                "Validation failed for one or more fields",
                request.getRequestURI()
        );
        response.setFieldErrors(fieldErrors);
        
        logger.warn("Validation failed: {}", fieldErrors);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParameter(
            MissingServletRequestParameterException ex, HttpServletRequest request) {
        
        ErrorResponse response = new ErrorResponse(
                ErrorCode.MISSING_REQUIRED_FIELD.getCode(),
                ErrorCode.MISSING_REQUIRED_FIELD.name(),
                String.format("Required parameter '%s' is missing", ex.getParameterName()),
                request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        
        String message = String.format("Parameter '%s' should be of type '%s'",
                ex.getName(), ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");
        
        ErrorResponse response = new ErrorResponse(
                ErrorCode.INVALID_INPUT.getCode(),
                ErrorCode.INVALID_INPUT.name(),
                message,
                request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleInvalidJson(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        
        ErrorResponse response = new ErrorResponse(
                ErrorCode.INVALID_INPUT.getCode(),
                ErrorCode.INVALID_INPUT.name(),
                "Invalid JSON format in request body",
                request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        
        ErrorResponse response = new ErrorResponse(
                405,
                "METHOD_NOT_ALLOWED",
                String.format("Method '%s' is not supported for this endpoint", ex.getMethod()),
                request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(response);
    }
    
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMediaTypeNotSupported(
            HttpMediaTypeNotSupportedException ex, HttpServletRequest request) {
        
        ErrorResponse response = new ErrorResponse(
                415,
                "UNSUPPORTED_MEDIA_TYPE",
                String.format("Media type '%s' is not supported", ex.getContentType()),
                request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(response);
    }
    
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoHandlerFound(
            NoHandlerFoundException ex, HttpServletRequest request) {
        
        ErrorResponse response = new ErrorResponse(
                ErrorCode.RESOURCE_NOT_FOUND.getCode(),
                ErrorCode.RESOURCE_NOT_FOUND.name(),
                String.format("Endpoint '%s' not found", ex.getRequestURL()),
                request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex, HttpServletRequest request) {
        
        logger.warn("Authentication failed: {}", ex.getMessage());
        
        ErrorResponse response = new ErrorResponse(
                ErrorCode.UNAUTHORIZED.getCode(),
                ErrorCode.UNAUTHORIZED.name(),
                "Authentication required",
                request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        
        logger.warn("Access denied: {}", ex.getMessage());
        
        ErrorResponse response = new ErrorResponse(
                ErrorCode.OPERATION_NOT_ALLOWED.getCode(),
                ErrorCode.OPERATION_NOT_ALLOWED.name(),
                "You don't have permission to access this resource",
                request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {
        
        logger.error("Unexpected error occurred: ", ex);
        
        ErrorResponse response = new ErrorResponse(
                ErrorCode.INTERNAL_ERROR.getCode(),
                ErrorCode.INTERNAL_ERROR.name(),
                "An unexpected error occurred. Please try again later.",
                request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
