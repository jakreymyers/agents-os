/**
 * Search Schemas for Asana MCP Server Phase 2
 * 
 * Comprehensive Zod validation schemas for search operations,
 * specifically designed to support the Phase 1 direct API alignment
 * with native Asana dot notation parameters.
 */

import { z } from 'zod';
import {
  GidSchema,
  DateSchema,
  DateTimeSchema,
  CommaListSchema,
  GidListSchema,
  OptFieldsSchema,
  SortBySchema,
  BooleanOrStringSchema,
  LimitSchema,
  ResourceSubtypeSchema,
  CustomFieldsSchema,
  ValidationUtils
} from './base.js';

/**
 * Comprehensive schema for asana_search_tasks with full API parameter coverage
 * Supports all Phase 1 dot notation parameters for maximum compatibility
 */
export const SearchTasksSchema = z.object({
  // Required parameters
  workspace: GidSchema,

  // Text search
  text: z.string().optional(),
  
  // Project filters (dot notation)
  'projects.any': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  'projects.all': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  'projects.not': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  
  // Section filters (dot notation) 
  'sections.any': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  'sections.all': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  'sections.not': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  
  // User/Assignee filters (dot notation)
  'assignee.any': ValidationUtils.userIdListOrMe.optional(),
  'assignee.not': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  'created_by.any': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  'created_by.not': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  'assigned_by.any': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  'assigned_by.not': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  'followers.any': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  'followers.not': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  'liked_by.any': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  'liked_by.not': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  'commented_on_by.any': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  'commented_on_by.not': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  
  // Date filters (dot notation)
  'due_on': DateSchema.optional(),
  'due_on.after': DateSchema.optional(),
  'due_on.before': DateSchema.optional(),
  'due_at.after': DateTimeSchema.optional(),
  'due_at.before': DateTimeSchema.optional(),
  'start_on': DateSchema.optional(),
  'start_on.after': DateSchema.optional(),
  'start_on.before': DateSchema.optional(),
  'created_at.after': DateTimeSchema.optional(),
  'created_at.before': DateTimeSchema.optional(),
  'created_on': DateSchema.optional(),
  'created_on.after': DateSchema.optional(),
  'created_on.before': DateSchema.optional(),
  'modified_at.after': DateTimeSchema.optional(),
  'modified_at.before': DateTimeSchema.optional(),
  'modified_on': DateSchema.optional(),
  'modified_on.after': DateSchema.optional(),
  'modified_on.before': DateSchema.optional(),
  'completed_at.after': DateTimeSchema.optional(),
  'completed_at.before': DateTimeSchema.optional(),
  'completed_on': DateSchema.optional(),
  'completed_on.after': DateSchema.optional(),
  'completed_on.before': DateSchema.optional(),
  
  // Task state filters
  completed: BooleanOrStringSchema.optional(),
  is_subtask: BooleanOrStringSchema.optional(),
  has_attachment: BooleanOrStringSchema.optional(),
  is_blocked: BooleanOrStringSchema.optional(),
  is_blocking: BooleanOrStringSchema.optional(),
  
  // Organization filters (dot notation)
  'tags.any': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  'tags.all': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  'tags.not': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  'teams.any': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  'portfolios.any': CommaListSchema.pipe(z.array(GidSchema)).optional(),
  
  // Resource type filters
  resource_subtype: ResourceSubtypeSchema.optional(),
  
  // Custom fields (complex object validation)
  custom_fields: CustomFieldsSchema,
  
  // Sorting and pagination
  sort_by: SortBySchema.optional(),
  sort_ascending: BooleanOrStringSchema.optional(),
  limit: z.union([z.number(), z.string().transform(Number)]).pipe(LimitSchema).optional(),
  offset: z.string().optional(),
  
  // Response options
  opt_fields: OptFieldsSchema
});

/**
 * Schema for asana_search_projects (Phase 3: Added pagination support)
 */
export const SearchProjectsSchema = z.object({
  workspace: GidSchema,
  name_pattern: z.string(),
  archived: BooleanOrStringSchema.optional(),
  
  // Phase 3: Pagination parameters
  limit: z.union([z.number(), z.string().transform(Number)]).pipe(LimitSchema).optional(),
  offset: z.string().optional(),
  
  opt_fields: OptFieldsSchema
});

/**
 * Schema for workspace operations (Phase 3: Added pagination support)
 */
export const ListWorkspacesSchema = z.object({
  // Phase 3: Pagination parameters
  limit: z.union([z.number(), z.string().transform(Number)]).pipe(LimitSchema).optional(),
  offset: z.string().optional(),
  
  opt_fields: OptFieldsSchema
});

/**
 * Type exports for use in handlers and tools
 */
export type SearchTasksParams = z.infer<typeof SearchTasksSchema>;
export type SearchProjectsParams = z.infer<typeof SearchProjectsSchema>;
export type ListWorkspacesParams = z.infer<typeof ListWorkspacesSchema>;

/**
 * Helper function to validate search tasks parameters
 * Provides detailed error context for validation failures
 */
export function validateSearchTasksParams(params: unknown): SearchTasksParams {
  const result = SearchTasksSchema.safeParse(params);
  
  if (!result.success) {
    // Create detailed error message for search task validation
    const errorDetails = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      received: 'received' in err ? err.received : undefined
    }));
    
    throw new Error(
      `Search tasks parameter validation failed:\n${
        errorDetails.map(detail => 
          `  - ${detail.field}: ${detail.message}${
            detail.received !== undefined ? ` (received: ${detail.received})` : ''
          }`
        ).join('\n')
      }`
    );
  }
  
  return result.data;
}

/**
 * Helper function to validate search projects parameters
 */
export function validateSearchProjectsParams(params: unknown): SearchProjectsParams {
  const result = SearchProjectsSchema.safeParse(params);
  
  if (!result.success) {
    const errorDetails = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    
    throw new Error(
      `Search projects parameter validation failed:\n${
        errorDetails.map(detail => `  - ${detail.field}: ${detail.message}`).join('\n')
      }`
    );
  }
  
  return result.data;
}

/**
 * Helper function to validate workspace list parameters
 */
export function validateListWorkspacesParams(params: unknown): ListWorkspacesParams {
  const result = ListWorkspacesSchema.safeParse(params);
  
  if (!result.success) {
    const errorDetails = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    
    throw new Error(
      `List workspaces parameter validation failed:\n${
        errorDetails.map(detail => `  - ${detail.field}: ${detail.message}`).join('\n')
      }`
    );
  }
  
  return result.data;
}

/**
 * Validation utilities specific to search operations
 */
export const SearchValidation = {
  /**
   * Validate that at least one search criteria is provided
   */
  hasSearchCriteria(params: SearchTasksParams): boolean {
    const {
      text,
      'projects.any': projectsAny,
      'assignee.any': assigneeAny,
      completed,
      is_subtask,
      // Add other key criteria as needed
    } = params;
    
    return !!(
      text ||
      projectsAny ||
      assigneeAny ||
      completed !== undefined ||
      is_subtask !== undefined
    );
  },

  /**
   * Provide suggestions for improving search performance
   */
  getPerformanceSuggestions(params: SearchTasksParams): string[] {
    const suggestions: string[] = [];
    
    // Suggest adding workspace filter
    if (!params.workspace) {
      suggestions.push('Specify a workspace to improve performance');
    }
    
    // Suggest limiting results
    if (!params.limit || params.limit > 50) {
      suggestions.push('Consider using a limit ≤ 50 for faster responses');
    }
    
    // Suggest using project filters
    if (!params['projects.any'] && !params['projects.all']) {
      suggestions.push('Adding project filters can significantly improve performance');
    }
    
    // Suggest using opt_fields
    if (!params.opt_fields) {
      suggestions.push('Use opt_fields to limit response size and improve performance');
    }
    
    return suggestions;
  },

  /**
   * Convert parameters to safe logging format (remove sensitive data)
   */
  toSafeLogFormat(params: SearchTasksParams): Record<string, any> {
    const safeParams = { ...params };
    
    // Remove potentially sensitive search text
    if (safeParams.text) {
      safeParams.text = `[${safeParams.text.length} characters]`;
    }
    
    return safeParams;
  }
};