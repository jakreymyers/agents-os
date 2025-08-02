/**
 * Pagination Utilities for Asana MCP Server Phase 3
 * 
 * Implements native Asana offset-based pagination with next_page tokens
 * as documented in the Asana API (not manual created_at approach).
 */

import { z } from 'zod';

// ============================================================================
// PAGINATION INTERFACES
// ============================================================================

/**
 * Pagination options for Asana API requests
 */
export interface PaginationOptions {
  /** Number of objects per page (1-100, default 20) */
  limit?: number;
  /** Pagination offset token from previous response */
  offset?: string;
}

/**
 * Next page information returned by Asana API
 */
export interface NextPageInfo {
  /** Offset token for the next page */
  offset: string;
  /** Relative path for the next page */
  path: string;
  /** Full URI for the next page */
  uri: string;
}

/**
 * Paginated response structure matching Asana API format
 */
export interface PaginatedResponse<T> {
  /** Array of data objects */
  data: T[];
  /** Next page information (null if no more pages) */
  next_page?: NextPageInfo | null;
}

/**
 * Internal response from Asana client methods
 */
export interface AsanaPaginatedResult<T> {
  /** Array of data objects */
  data: T[];
  /** Next page information if available */
  next_page?: NextPageInfo | null;
}

// ============================================================================
// PAGINATION VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for pagination parameters validation
 */
export const PaginationOptionsSchema = z.object({
  limit: z.number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100 (Asana API limit)')
    .optional(),
  offset: z.string().optional()
});

/**
 * Schema for next page validation
 */
export const NextPageSchema = z.object({
  offset: z.string(),
  path: z.string(),
  uri: z.string()
}).nullable().optional();

// ============================================================================
// PAGINATION UTILITIES
// ============================================================================

/**
 * Validate pagination options against Asana API constraints
 */
export function validatePaginationOptions(options: PaginationOptions): PaginationOptions {
  const result = PaginationOptionsSchema.safeParse(options);
  
  if (!result.success) {
    throw new Error(
      `Invalid pagination options: ${result.error.errors.map(e => e.message).join(', ')}`
    );
  }
  
  return result.data;
}

/**
 * Create pagination parameters for Asana API requests
 */
export function createPaginationParams(options: PaginationOptions = {}): Record<string, any> {
  const validated = validatePaginationOptions(options);
  const params: Record<string, any> = {};
  
  // Set limit (default to 20 if not specified, max 100)
  params.limit = Math.min(validated.limit || 20, 100);
  
  // Add offset if provided
  if (validated.offset) {
    params.offset = validated.offset;
  }
  
  return params;
}

/**
 * Extract pagination info from Asana API response
 */
export function extractPaginationInfo<T>(response: any): PaginatedResponse<T> {
  // Handle both direct array responses and wrapped responses
  const data = Array.isArray(response) ? response : (response.data || []);
  const nextPage = response.next_page || null;
  
  return {
    data,
    next_page: nextPage
  };
}

/**
 * Check if there are more pages available
 */
export function hasMorePages<T>(response: PaginatedResponse<T>): boolean {
  return response.next_page !== null && response.next_page !== undefined;
}

/**
 * Get the offset token for the next page
 */
export function getNextPageOffset<T>(response: PaginatedResponse<T>): string | null {
  return response.next_page?.offset || null;
}

/**
 * Create pagination summary for logging/debugging
 */
export function createPaginationSummary<T>(
  response: PaginatedResponse<T>, 
  currentPage: number = 1
): string {
  const hasNext = hasMorePages(response);
  const resultCount = response.data.length;
  
  return `Page ${currentPage}: ${resultCount} results${hasNext ? ' (more available)' : ' (last page)'}`;
}

// ============================================================================
// PAGINATION HELPER FUNCTIONS
// ============================================================================

/**
 * Generic pagination helper for any Asana API method
 */
export async function paginateAsanaRequest<T>(
  requestFn: (params: any) => Promise<any>,
  baseParams: any = {},
  paginationOptions: PaginationOptions = {}
): Promise<PaginatedResponse<T>> {
  const paginationParams = createPaginationParams(paginationOptions);
  const fullParams = { ...baseParams, ...paginationParams };
  
  try {
    const response = await requestFn(fullParams);
    return extractPaginationInfo<T>(response);
  } catch (error) {
    throw new Error(`Pagination request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Collect all pages from a paginated Asana API request
 * WARNING: Use with caution for large datasets due to rate limiting
 */
export async function collectAllPages<T>(
  requestFn: (params: any) => Promise<any>,
  baseParams: any = {},
  maxPages: number = 10
): Promise<T[]> {
  const allResults: T[] = [];
  let currentOffset: string | undefined = undefined;
  let pageCount = 0;
  
  while (pageCount < maxPages) {
    const paginationOptions: PaginationOptions = currentOffset ? { offset: currentOffset } : {};
    const response = await paginateAsanaRequest<T>(requestFn, baseParams, paginationOptions);
    
    allResults.push(...response.data);
    pageCount++;
    
    if (!hasMorePages(response)) {
      break;
    }
    
    currentOffset = getNextPageOffset(response);
    if (!currentOffset) {
      break;
    }
  }
  
  return allResults;
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type PaginationParams = z.infer<typeof PaginationOptionsSchema>;