/**
 * Phase 2: Enhanced Error Handling with Zod Validation Support
 * 
 * This module extends the existing error handling system with specific support
 * for Zod schema validation and provides additional error classes for Phase 2.
 */

import { z } from 'zod';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { 
  enhanceAsanaError, 
  asanaErrorToMcpError, 
  createInvalidParamsError 
} from './errors.js';

/**
 * Enhanced Asana API Error class with structured information
 */
export class AsanaAPIError extends Error {
  public readonly name = 'AsanaAPIError';
  
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly asanaErrorCode?: string,
    public readonly originalError?: any,
    public readonly context?: string
  ) {
    super(message);
    
    // Maintain proper stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AsanaAPIError);
    }
  }

  /**
   * Convert to MCP error format for proper API response
   */
  toMcpError(): McpError {
    const enhancedError = enhanceAsanaError(this.originalError, this.context);
    return asanaErrorToMcpError(enhancedError);
  }

  /**
   * Get user-friendly error message with context
   */
  getUserMessage(): string {
    if (this.context) {
      return `${this.context}: ${this.message}`;
    }
    return this.message;
  }
}

/**
 * Validation Error class for Zod schema validation failures
 */
export class ValidationError extends Error {
  public readonly name = 'ValidationError';
  
  constructor(
    message: string,
    public readonly validationErrors: z.ZodError,
    public readonly field?: string
  ) {
    super(message);
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Get formatted validation error details for debugging
   */
  getValidationDetails(): Array<{
    path: string;
    message: string;
    code: string;
    received?: any;
  }> {
    return this.validationErrors.errors.map(error => ({
      path: error.path.join('.'),
      message: error.message,
      code: error.code,
      received: 'received' in error ? error.received : undefined
    }));
  }

  /**
   * Get user-friendly error message summarizing validation issues
   */
  getUserMessage(): string {
    const issues = this.getValidationDetails();
    
    if (issues.length === 1) {
      const issue = issues[0];
      const fieldName = issue.path || this.field || 'parameter';
      return `Invalid ${fieldName}: ${issue.message}`;
    }
    
    const fieldList = issues.map(issue => 
      issue.path || this.field || 'parameter'
    ).join(', ');
    
    return `Validation failed for fields: ${fieldList}. Please check the parameter format.`;
  }

  /**
   * Convert to MCP error format for proper API response
   */
  toMcpError(): McpError {
    return createInvalidParamsError(
      this.getUserMessage(),
      {
        validationErrors: this.getValidationDetails(),
        field: this.field
      }
    );
  }
}

/**
 * Authentication Error for token-related issues
 */
export class AuthenticationError extends AsanaAPIError {
  public readonly name = 'AuthenticationError';
  
  constructor(message?: string, originalError?: any) {
    super(
      message || 'Authentication failed. Please check your Asana access token.',
      401,
      'UNAUTHORIZED',
      originalError,
      'Authentication'
    );
  }
}

/**
 * Rate Limit Error for 429 responses
 */
export class RateLimitError extends AsanaAPIError {
  public readonly name = 'RateLimitError';
  
  constructor(message?: string, originalError?: any) {
    super(
      message || 'Rate limit exceeded. Please wait before making more requests.',
      429,
      'RATE_LIMIT_EXCEEDED',
      originalError,
      'Rate Limiting'
    );
  }
}

/**
 * Permission Error for 403 responses
 */
export class PermissionError extends AsanaAPIError {
  public readonly name = 'PermissionError';
  
  constructor(message?: string, originalError?: any) {
    super(
      message || 'Permission denied. Your access token may not have the required permissions.',
      403,
      'FORBIDDEN',
      originalError,
      'Permissions'
    );
  }
}

/**
 * Resource Not Found Error for 404 responses
 */
export class ResourceNotFoundError extends AsanaAPIError {
  public readonly name = 'ResourceNotFoundError';
  
  constructor(resourceType?: string, resourceId?: string, originalError?: any) {
    const message = resourceType && resourceId
      ? `${resourceType} with ID ${resourceId} not found`
      : 'Resource not found or may have been deleted';
      
    super(
      message,
      404,
      'NOT_FOUND',
      originalError,
      'Resource Lookup'
    );
  }
}

/**
 * Enhanced error handler functions for common scenarios
 */
export const ErrorHandlers = {
  /**
   * Handle Asana API errors with enhanced context
   */
  handleAsanaError(error: any, context?: string): AsanaAPIError {
    if (error instanceof AsanaAPIError) {
      return error;
    }

    const enhanced = enhanceAsanaError(error, context);
    
    // Create specific error types based on status code
    switch (enhanced.status) {
      case 401:
        return new AuthenticationError(enhanced.message, error);
      case 403:
        return new PermissionError(enhanced.message, error);
      case 404:
        return new ResourceNotFoundError(undefined, undefined, error);
      case 429:
        return new RateLimitError(enhanced.message, error);
      default:
        return new AsanaAPIError(
          enhanced.message,
          enhanced.status,
          enhanced.code,
          error,
          context
        );
    }
  },

  /**
   * Handle Zod validation errors with helpful messages
   */
  handleValidationError(
    zodError: z.ZodError,
    field?: string,
    context?: string
  ): ValidationError {
    const message = context 
      ? `Validation failed for ${context}` 
      : 'Parameter validation failed';
      
    return new ValidationError(message, zodError, field);
  },

  /**
   * Validate parameters using a Zod schema
   */
  validateParams<T>(
    schema: z.ZodSchema<T>,
    params: unknown,
    context?: string
  ): T {
    const result = schema.safeParse(params);
    
    if (!result.success) {
      throw this.handleValidationError(result.error, undefined, context);
    }
    
    return result.data;
  },

  /**
   * Safe async operation wrapper with comprehensive error handling
   */
  async safeOperation<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      // Handle validation errors
      if (error instanceof ValidationError) {
        throw error.toMcpError();
      }
      
      // Handle Asana API errors
      if (error instanceof AsanaAPIError) {
        throw error.toMcpError();
      }
      
      // Handle unknown errors
      const asanaError = this.handleAsanaError(error, context);
      throw asanaError.toMcpError();
    }
  },

  /**
   * Create user-friendly error response for MCP
   */
  createErrorResponse(error: any, operation?: string): {
    error: string;
    details?: any;
    suggestion?: string;
  } {
    if (error instanceof ValidationError) {
      return {
        error: error.getUserMessage(),
        details: error.getValidationDetails(),
        suggestion: 'Please check the parameter format and try again'
      };
    }
    
    if (error instanceof AsanaAPIError) {
      const response: any = {
        error: error.getUserMessage()
      };
      
      // Add helpful suggestions based on error type
      if (error instanceof AuthenticationError) {
        response.suggestion = 'Verify your Asana access token is valid and not expired';
      } else if (error instanceof PermissionError) {
        response.suggestion = 'Check that your access token has the required permissions';
      } else if (error instanceof ResourceNotFoundError) {
        response.suggestion = 'Verify the resource ID is correct and the item still exists';
      } else if (error instanceof RateLimitError) {
        response.suggestion = 'Wait a few moments before retrying the request';
      }
      
      return response;
    }
    
    // Handle generic errors
    return {
      error: error.message || 'An unexpected error occurred',
      suggestion: operation ? `Try the ${operation} operation again or contact support` : 'Please try again or contact support'
    };
  }
};

/**
 * Type-safe error result wrapper for operations that might fail
 */
export type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

/**
 * Create a successful result
 */
export function createSuccess<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Create a failed result
 */
export function createFailure<E = Error>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Wrap async operations in Result type for safer error handling
 */
export async function safeAsync<T>(
  operation: () => Promise<T>
): Promise<Result<T, AsanaAPIError | ValidationError>> {
  try {
    const data = await operation();
    return createSuccess(data);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof AsanaAPIError) {
      return createFailure(error);
    }
    
    // Convert other errors to AsanaAPIError
    const asanaError = ErrorHandlers.handleAsanaError(error);
    return createFailure(asanaError);
  }
}