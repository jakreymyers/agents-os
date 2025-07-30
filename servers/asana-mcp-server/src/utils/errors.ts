/**
 * Enhanced error handling utilities for Asana MCP Server
 * 
 * This module provides standardized error handling following MCP best practices
 * and enhances Asana API errors with additional context and user-friendly messages.
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * Check if an error is an MCP error
 */
export function isMcpError(error: any): error is McpError {
  return error && typeof error === 'object' && 'code' in error && 'message' in error;
}

/**
 * Create a standardized MCP error for invalid requests
 */
export function createInvalidRequestError(message: string, data?: any): McpError {
  return new McpError(ErrorCode.InvalidRequest, message, data);
}

/**
 * Create a standardized MCP error for method not found
 */
export function createMethodNotFoundError(message: string, data?: any): McpError {
  return new McpError(ErrorCode.MethodNotFound, message, data);
}

/**
 * Create a standardized MCP error for internal errors
 */
export function createInternalError(message: string, originalError?: any): McpError {
  const data = originalError ? {
    originalError: originalError.message || String(originalError)
  } : undefined;
  
  return new McpError(ErrorCode.InternalError, message, data);
}

/**
 * Create a standardized MCP error for invalid parameters
 */
export function createInvalidParamsError(message: string, data?: any): McpError {
  return new McpError(ErrorCode.InvalidParams, message, data);
}

/**
 * Enhanced Asana API error with additional context
 */
export interface EnhancedAsanaError {
  message: string;
  status?: number;
  code?: string;
  originalError?: any;
  context?: string;
}

/**
 * Enhance Asana API errors with additional context and standardized format
 */
export function enhanceAsanaError(error: any, context?: string): EnhancedAsanaError {
  // Handle Asana SDK errors with nested error structure
  if (error && error.value && error.value.errors && Array.isArray(error.value.errors)) {
    const asanaError = error.value.errors[0];
    return {
      message: context ? `${context}: ${asanaError.message}` : asanaError.message,
      code: asanaError.phrase || 'ASANA_API_ERROR',
      status: error.status || error.statusCode,
      context,
      originalError: error
    };
  }

  // Handle HTTP response errors
  if (error && error.response && error.response.status) {
    const status = error.response.status;
    const statusText = error.response.statusText || 'Unknown Error';
    
    let message = `HTTP ${status} ${statusText}`;
    if (error.response.data && error.response.data.errors) {
      const asanaErrors = error.response.data.errors;
      if (Array.isArray(asanaErrors) && asanaErrors.length > 0) {
        message = asanaErrors[0].message || message;
      }
    }
    
    return {
      message: context ? `${context}: ${message}` : message,
      status,
      code: `HTTP_${status}`,
      context,
      originalError: error
    };
  }

  // Handle network/connection errors
  if (error && error.code === 'ENOTFOUND') {
    return {
      message: context ? `${context}: Network connection failed - unable to reach Asana API` : 'Network connection failed - unable to reach Asana API',
      code: 'NETWORK_ERROR',
      context,
      originalError: error
    };
  }

  if (error && error.code === 'ECONNREFUSED') {
    return {
      message: context ? `${context}: Connection refused by Asana API` : 'Connection refused by Asana API',
      code: 'CONNECTION_REFUSED',
      context,
      originalError: error
    };
  }

  // Handle timeout errors
  if (error && (error.code === 'ETIMEDOUT' || error.message?.includes('timeout'))) {
    return {
      message: context ? `${context}: Request timeout - Asana API did not respond in time` : 'Request timeout - Asana API did not respond in time',
      code: 'TIMEOUT',
      context,
      originalError: error
    };
  }

  // Handle specific HTTP status codes with better messaging
  if (error && error.status) {
    switch (error.status) {
      case 401:
        return {
          message: context ? `${context}: Authentication failed - check your Asana access token` : 'Authentication failed - check your Asana access token',
          status: 401,
          code: 'UNAUTHORIZED',
          context,
          originalError: error
        };
      
      case 403:
        return {
          message: context ? `${context}: Permission denied - insufficient privileges for this operation` : 'Permission denied - insufficient privileges for this operation',
          status: 403,
          code: 'FORBIDDEN',
          context,
          originalError: error
        };
      
      case 404:
        return {
          message: context ? `${context}: Resource not found - the requested item may have been deleted or doesn't exist` : 'Resource not found - the requested item may have been deleted or doesn\'t exist',
          status: 404,
          code: 'NOT_FOUND',
          context,
          originalError: error
        };
      
      case 429:
        return {
          message: context ? `${context}: Rate limit exceeded - please wait before making more requests` : 'Rate limit exceeded - please wait before making more requests',
          status: 429,
          code: 'RATE_LIMITED',
          context,
          originalError: error
        };
      
      case 500:
        return {
          message: context ? `${context}: Asana server error - please try again later` : 'Asana server error - please try again later',
          status: 500,
          code: 'SERVER_ERROR',
          context,
          originalError: error
        };
    }
  }

  // Handle generic errors
  const message = error?.message || String(error) || 'Unknown error occurred';
  return {
    message: context ? `${context}: ${message}` : message,
    context,
    originalError: error
  };
}

/**
 * Convert an enhanced Asana error to an appropriate MCP error
 */
export function asanaErrorToMcpError(enhancedError: EnhancedAsanaError): McpError {
  // Map specific error codes to appropriate MCP error types
  switch (enhancedError.code) {
    case 'UNAUTHORIZED':
      return new McpError(ErrorCode.InvalidRequest, enhancedError.message, {
        asanaError: enhancedError,
        suggestion: 'Please verify your Asana access token is valid and has not expired'
      });
    
    case 'FORBIDDEN':
      return new McpError(ErrorCode.InvalidRequest, enhancedError.message, {
        asanaError: enhancedError,
        suggestion: 'Check that your access token has the required permissions for this workspace and operation'
      });
    
    case 'NOT_FOUND':
      return new McpError(ErrorCode.InvalidParams, enhancedError.message, {
        asanaError: enhancedError,
        suggestion: 'Verify the GID is correct and the resource still exists'
      });
    
    case 'RATE_LIMITED':
      return new McpError(ErrorCode.InternalError, enhancedError.message, {
        asanaError: enhancedError,
        suggestion: 'Wait a few moments before retrying the request'
      });
    
    case 'NETWORK_ERROR':
    case 'CONNECTION_REFUSED':
    case 'TIMEOUT':
      return new McpError(ErrorCode.InternalError, enhancedError.message, {
        asanaError: enhancedError,
        suggestion: 'Check your internet connection and try again'
      });
    
    case 'SERVER_ERROR':
      return new McpError(ErrorCode.InternalError, enhancedError.message, {
        asanaError: enhancedError,
        suggestion: 'This is an Asana server issue. Please try again later'
      });
    
    default:
      // For validation errors and other client errors (4xx)
      if (enhancedError.status && enhancedError.status >= 400 && enhancedError.status < 500) {
        return new McpError(ErrorCode.InvalidParams, enhancedError.message, {
          asanaError: enhancedError
        });
      }
      
      // For server errors and unknown errors (5xx and others)
      return new McpError(ErrorCode.InternalError, enhancedError.message, {
        asanaError: enhancedError
      });
  }
}

/**
 * Safely execute Asana API calls with enhanced error handling
 * 
 * This wrapper function provides consistent error handling for all Asana API operations
 * and converts Asana errors to appropriate MCP errors.
 */
export async function safeAsanaCall<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const enhancedError = enhanceAsanaError(error, context);
    throw asanaErrorToMcpError(enhancedError);
  }
}

/**
 * Wrapper for handling read-only mode restrictions
 */
export function checkReadOnlyMode(isReadOnly: boolean, operation: string): void {
  if (isReadOnly) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      `Operation "${operation}" is not allowed in read-only mode`,
      {
        suggestion: 'To perform write operations, disable read-only mode in your configuration'
      }
    );
  }
}

/**
 * Create a user-friendly error message for common scenarios
 */
export function createUserFriendlyError(error: any, operation: string): McpError {
  const enhancedError = enhanceAsanaError(error, operation);
  
  // Provide specific guidance based on error type
  let suggestion = '';
  
  if (enhancedError.code === 'UNAUTHORIZED') {
    suggestion = 'Please check your Asana access token in the configuration';
  } else if (enhancedError.code === 'NOT_FOUND') {
    suggestion = 'Verify that the resource exists and you have access to it';
  } else if (enhancedError.code === 'FORBIDDEN') {
    suggestion = 'Make sure your access token has the necessary permissions';
  } else if (enhancedError.code === 'RATE_LIMITED') {
    suggestion = 'Please wait a moment before trying again';
  }
  
  return new McpError(
    ErrorCode.InternalError,
    enhancedError.message,
    {
      asanaError: enhancedError,
      suggestion,
      operation
    }
  );
}