/**
 * Enhanced input validation utilities using Zod
 * 
 * This module provides robust parameter validation for all Asana MCP tools
 * with comprehensive error messages and type safety.
 */

import { z } from 'zod';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * Validate tool input against a Zod schema with enhanced error reporting
 */
export function validateToolInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => {
        const path = err.path.length > 0 ? err.path.join('.') : 'root';
        return `${path}: ${err.message}`;
      });
      
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid parameters: ${errorMessages.join(', ')}`,
        {
          validationErrors: error.errors,
          receivedInput: input
        }
      );
    }
    
    throw new McpError(
      ErrorCode.InvalidParams,
      'Failed to validate input parameters',
      { originalError: error }
    );
  }
}

/**
 * Common validation schemas for Asana data types
 */
export const commonSchemas = {
  /** GID validation - Asana Global IDs are numeric strings */
  gid: z.string().regex(/^\d+$/, 'GID must be a numeric string'),
  
  /** Optional GID */
  optionalGid: z.string().regex(/^\d+$/, 'GID must be a numeric string').optional(),
  
  /** Array of GIDs */
  gidArray: z.array(z.string().regex(/^\d+$/, 'Each GID must be a numeric string')),
  
  /** Date string in ISO format */
  isoDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  
  /** Optional date string */
  optionalIsoDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  
  /** Non-empty string */
  nonEmptyString: z.string().min(1, 'String cannot be empty'),
  
  /** Optional non-empty string */
  optionalNonEmptyString: z.string().min(1, 'String cannot be empty').optional(),
  
  /** Boolean with default */
  booleanWithDefault: (defaultValue: boolean) => z.boolean().default(defaultValue),
  
  /** Pagination limit */
  limit: z.number().int().min(1).max(100, 'Limit must be between 1 and 100').optional(),
  
  /** Pagination offset */
  offset: z.number().int().min(0, 'Offset must be a non-negative integer').optional(),
  
  /** Task completion status */
  completed: z.boolean().optional(),
  
  /** Project status types */
  statusType: z.enum(['on_track', 'at_risk', 'off_track', 'on_hold', 'complete']),
  
  /** Project status colors */
  statusColor: z.enum(['green', 'yellow', 'red', 'blue']).optional(),
  
  /** Custom fields object */
  customFields: z.record(z.string(), z.any()).optional(),
  
  /** Email validation */
  email: z.string().email('Must be a valid email address').optional(),
  
  /** URL validation */
  url: z.string().url('Must be a valid URL').optional(),
  
  /** Text search query */
  searchText: z.string().min(1, 'Search text cannot be empty').optional(),
};

/**
 * Validation schemas for workspace operations
 */
export const workspaceSchemas = {
  listWorkspaces: z.object({}),
  
  getTagsForWorkspace: z.object({
    workspace_gid: commonSchemas.gid,
    limit: commonSchemas.limit,
    offset: commonSchemas.offset,
  }),
};

/**
 * Validation schemas for project operations
 */
export const projectSchemas = {
  searchProjects: z.object({
    workspace_gid: commonSchemas.optionalGid,
    team_gid: commonSchemas.optionalGid,
    name_pattern: commonSchemas.searchText,
    limit: commonSchemas.limit,
    offset: commonSchemas.offset,
  }),
  
  getProject: z.object({
    project_gid: commonSchemas.gid,
  }),
  
  getProjectTaskCounts: z.object({
    project_gid: commonSchemas.gid,
  }),
  
  getProjectSections: z.object({
    project_gid: commonSchemas.gid,
    limit: commonSchemas.limit,
    offset: commonSchemas.offset,
  }),
  
  getProjectStatus: z.object({
    project_status_gid: commonSchemas.gid,
  }),
  
  getProjectStatuses: z.object({
    project_gid: commonSchemas.gid,
    limit: commonSchemas.limit,
    offset: commonSchemas.offset,
  }),
  
  createProjectStatus: z.object({
    project_gid: commonSchemas.gid,
    status_type: commonSchemas.statusType,
    text: commonSchemas.optionalNonEmptyString,
    color: commonSchemas.statusColor,
    html_text: commonSchemas.optionalNonEmptyString,
  }),
  
  deleteProjectStatus: z.object({
    project_status_gid: commonSchemas.gid,
  }),
};

/**
 * Validation schemas for task operations
 */
export const taskSchemas = {
  searchTasks: z.object({
    project_gid: commonSchemas.optionalGid,
    completed: commonSchemas.completed,
    assignee_gid: commonSchemas.optionalGid,
    text: commonSchemas.searchText,
    limit: commonSchemas.limit,
    offset: commonSchemas.offset,
  }),
  
  getTask: z.object({
    task_gid: commonSchemas.gid,
  }),
  
  createTask: z.object({
    name: commonSchemas.nonEmptyString,
    notes: z.string().optional(),
    projects: commonSchemas.gidArray.optional(),
    assignee: commonSchemas.optionalGid,
    due_date: commonSchemas.optionalIsoDate,
    parent: commonSchemas.optionalGid,
    tags: commonSchemas.gidArray.optional(),
    followers: commonSchemas.gidArray.optional(),
    custom_fields: commonSchemas.customFields,
  }),
  
  updateTask: z.object({
    task_gid: commonSchemas.gid,
    name: commonSchemas.optionalNonEmptyString,
    notes: z.string().optional(),
    completed: z.boolean().optional(),
    assignee: commonSchemas.optionalGid,
    due_date: commonSchemas.optionalIsoDate,
    tags: commonSchemas.gidArray.optional(),
    followers: commonSchemas.gidArray.optional(),
    custom_fields: commonSchemas.customFields,
  }),
  
  createSubtask: z.object({
    parent_task_gid: commonSchemas.gid,
    name: commonSchemas.nonEmptyString,
    notes: z.string().optional(),
    assignee: commonSchemas.optionalGid,
    due_date: commonSchemas.optionalIsoDate,
  }),
  
  getMultipleTasksByGid: z.object({
    task_gids: commonSchemas.gidArray,
  }),
  
  setParentForTask: z.object({
    task_gid: commonSchemas.gid,
    parent_task_gid: commonSchemas.gid,
  }),
  
  getTaskStories: z.object({
    task_gid: commonSchemas.gid,
    limit: commonSchemas.limit,
    offset: commonSchemas.offset,
  }),
  
  createTaskStory: z.object({
    task_gid: commonSchemas.gid,
    text: commonSchemas.nonEmptyString,
    html_text: z.string().optional(),
  }),
  
  addTaskDependencies: z.object({
    task_gid: commonSchemas.gid,
    dependencies: commonSchemas.gidArray,
  }),
  
  addTaskDependents: z.object({
    task_gid: commonSchemas.gid,
    dependents: commonSchemas.gidArray,
  }),
  
  getTasksForTag: z.object({
    tag_gid: commonSchemas.gid,
    limit: commonSchemas.limit,
    offset: commonSchemas.offset,
  }),
};