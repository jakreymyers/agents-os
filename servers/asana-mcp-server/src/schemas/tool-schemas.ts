/**
 * Tool Schemas for Asana MCP Server Phase 2
 * 
 * Comprehensive Zod validation schemas for all MCP tools
 * excluding search operations (which are in search-schemas.ts)
 */

import { z } from 'zod';
import {
  GidSchema,
  DateSchema,
  OptFieldsSchema,
  BooleanOrStringSchema,
  ResourceSubtypeSchema,
  ProjectStatusColorSchema,
  ValidationUtils,
  LimitSchema
} from './base.js';

// ============================================================================
// TASK MANAGEMENT SCHEMAS
// ============================================================================

/**
 * Schema for asana_get_task
 */
export const GetTaskSchema = z.object({
  task_id: GidSchema,
  opt_fields: OptFieldsSchema
});

/**
 * Schema for asana_create_task
 */
export const CreateTaskSchema = z.object({
  project_id: GidSchema,
  name: z.string().min(1, 'Task name cannot be empty'),
  notes: z.string().optional(),
  html_notes: z.string().optional(),
  due_on: DateSchema.optional(),
  assignee: ValidationUtils.userIdOrMe.optional(),
  followers: z.array(GidSchema).optional(),
  parent: GidSchema.optional(),
  projects: z.array(GidSchema).optional(),
  resource_subtype: ResourceSubtypeSchema.optional(),
  custom_fields: z.record(z.union([z.string(), z.number(), z.boolean()])).optional()
});

/**
 * Schema for asana_update_task
 */
export const UpdateTaskSchema = z.object({
  task_id: GidSchema,
  name: z.string().optional(),
  notes: z.string().optional(),
  html_notes: z.string().optional(),
  due_on: DateSchema.optional(),
  assignee: ValidationUtils.userIdOrMe.optional(),
  completed: BooleanOrStringSchema.optional(),
  resource_subtype: ResourceSubtypeSchema.optional(),
  custom_fields: z.record(z.union([z.string(), z.number(), z.boolean()])).optional()
});

/**
 * Schema for asana_get_multiple_tasks_by_gid
 */
export const GetMultipleTasksByGidSchema = z.object({
  task_ids: z.union([
    z.array(GidSchema).max(25, 'Maximum 25 tasks allowed'),
    z.string().transform(str => str.split(',').map(s => s.trim()).filter(Boolean)).pipe(
      z.array(GidSchema).max(25, 'Maximum 25 tasks allowed')
    )
  ]),
  opt_fields: OptFieldsSchema
});

// ============================================================================
// TASK RELATIONSHIP SCHEMAS  
// ============================================================================

/**
 * Schema for asana_create_subtask
 */
export const CreateSubtaskSchema = z.object({
  parent_task_id: GidSchema,
  name: z.string().min(1, 'Subtask name cannot be empty'),
  notes: z.string().optional(),
  html_notes: z.string().optional(),
  due_on: DateSchema.optional(),
  assignee: ValidationUtils.userIdOrMe.optional(),
  opt_fields: OptFieldsSchema
});

/**
 * Schema for asana_add_task_dependencies
 */
export const AddTaskDependenciesSchema = z.object({
  task_id: GidSchema,
  dependencies: z.array(GidSchema).min(1, 'At least one dependency required')
});

/**
 * Schema for asana_add_task_dependents
 */
export const AddTaskDependentsSchema = z.object({
  task_id: GidSchema,
  dependents: z.array(GidSchema).min(1, 'At least one dependent required')
});

/**
 * Schema for asana_set_parent_for_task
 */
export const SetParentForTaskSchema = z.object({
  task_id: GidSchema,
  data: z.object({
    parent: GidSchema.nullable(),
    insert_after: GidSchema.optional(),
    insert_before: GidSchema.optional()
  }).refine(
    data => !(data.insert_after && data.insert_before),
    { message: "Cannot specify both insert_after and insert_before" }
  ),
  opts: z.object({
    opt_fields: OptFieldsSchema
  }).optional()
});

// ============================================================================
// COMMENTS & COMMUNICATION SCHEMAS
// ============================================================================

/**
 * Schema for asana_get_task_stories
 */
export const GetTaskStoriesSchema = z.object({
  task_id: GidSchema,
  opt_fields: OptFieldsSchema
});

/**
 * Schema for asana_create_task_story
 */
export const CreateTaskStorySchema = z.object({
  task_id: GidSchema,
  text: z.string().optional(),
  html_text: z.string().optional(),
  opt_fields: OptFieldsSchema
}).refine(
  data => data.text || data.html_text,
  { message: "Either 'text' or 'html_text' must be provided" }
);

// ============================================================================
// PROJECT MANAGEMENT SCHEMAS
// ============================================================================

/**
 * Schema for asana_get_project
 */
export const GetProjectSchema = z.object({
  project_id: GidSchema,
  opt_fields: OptFieldsSchema
});

/**
 * Schema for asana_get_project_task_counts
 */
export const GetProjectTaskCountsSchema = z.object({
  project_id: GidSchema,
  opt_fields: OptFieldsSchema
});

/**
 * Schema for asana_get_project_sections
 */
export const GetProjectSectionsSchema = z.object({
  project_id: GidSchema,
  opt_fields: OptFieldsSchema
});

// ============================================================================
// PROJECT STATUS SCHEMAS
// ============================================================================

/**
 * Schema for asana_get_project_status
 */
export const GetProjectStatusSchema = z.object({
  project_status_gid: GidSchema,
  opt_fields: OptFieldsSchema
});

/**
 * Schema for asana_get_project_statuses
 */
export const GetProjectStatusesForProjectSchema = z.object({
  project_gid: GidSchema,
  limit: z.union([z.number(), z.string().transform(Number)]).pipe(LimitSchema).optional(),
  offset: z.string().optional(),
  opt_fields: OptFieldsSchema
});

/**
 * Schema for asana_create_project_status
 */
export const CreateProjectStatusSchema = z.object({
  project_gid: GidSchema,
  text: z.string().min(1, 'Status text cannot be empty'),
  color: ProjectStatusColorSchema.optional(),
  title: z.string().optional(),
  html_text: z.string().optional(),
  opt_fields: OptFieldsSchema
});

/**
 * Schema for asana_delete_project_status
 */
export const DeleteProjectStatusSchema = z.object({
  project_status_gid: GidSchema
});

// ============================================================================
// TAG & ORGANIZATION SCHEMAS
// ============================================================================

/**
 * Schema for asana_get_tasks_for_tag
 */
export const GetTasksForTagSchema = z.object({
  tag_gid: GidSchema,
  opt_fields: OptFieldsSchema,
  opt_pretty: BooleanOrStringSchema.optional(),
  limit: z.union([z.number(), z.string().transform(Number)]).pipe(LimitSchema).optional(),
  offset: z.string().optional()
});

/**
 * Schema for asana_get_tags_for_workspace
 */
export const GetTagsForWorkspaceSchema = z.object({
  workspace_gid: GidSchema,
  limit: z.union([z.number(), z.string().transform(Number)]).pipe(LimitSchema).optional(),
  offset: z.string().optional(),
  opt_fields: OptFieldsSchema
});

// ============================================================================
// WORKSPACE SCHEMAS
// ============================================================================

/**
 * Schema for asana_list_workspaces
 */
export const ListWorkspacesSchema = z.object({
  opt_fields: OptFieldsSchema
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type GetTaskParams = z.infer<typeof GetTaskSchema>;
export type CreateTaskParams = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskParams = z.infer<typeof UpdateTaskSchema>;
export type GetMultipleTasksByGidParams = z.infer<typeof GetMultipleTasksByGidSchema>;

export type CreateSubtaskParams = z.infer<typeof CreateSubtaskSchema>;
export type AddTaskDependenciesParams = z.infer<typeof AddTaskDependenciesSchema>;
export type AddTaskDependentsParams = z.infer<typeof AddTaskDependentsSchema>;
export type SetParentForTaskParams = z.infer<typeof SetParentForTaskSchema>;

export type GetTaskStoriesParams = z.infer<typeof GetTaskStoriesSchema>;
export type CreateTaskStoryParams = z.infer<typeof CreateTaskStorySchema>;

export type GetProjectParams = z.infer<typeof GetProjectSchema>;
export type GetProjectTaskCountsParams = z.infer<typeof GetProjectTaskCountsSchema>;
export type GetProjectSectionsParams = z.infer<typeof GetProjectSectionsSchema>;

export type GetProjectStatusParams = z.infer<typeof GetProjectStatusSchema>;
export type GetProjectStatusesForProjectParams = z.infer<typeof GetProjectStatusesForProjectSchema>;
export type CreateProjectStatusParams = z.infer<typeof CreateProjectStatusSchema>;
export type DeleteProjectStatusParams = z.infer<typeof DeleteProjectStatusSchema>;

export type GetTasksForTagParams = z.infer<typeof GetTasksForTagSchema>;
export type GetTagsForWorkspaceParams = z.infer<typeof GetTagsForWorkspaceSchema>;

export type ListWorkspacesParams = z.infer<typeof ListWorkspacesSchema>;

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Validation helper to ensure HTML content follows Asana's restrictions
 */
export function validateAsanaHtml(html: string): string[] {
  const errors: string[] = [];
  
  // List of allowed HTML tags based on Asana's documentation
  const allowedTags = [
    'body', 'h1', 'h2', 'ol', 'ul', 'li', 'strong', 'em', 'u', 's',
    'code', 'pre', 'blockquote', 'a', 'hr', 'img', 'table', 'tr', 'td'
  ];
  
  // Simple regex to find HTML tags (this is basic validation)
  const tagRegex = /<(\/?[a-zA-Z][a-zA-Z0-9\-]*)[^>]*>/g;
  let match;
  
  while ((match = tagRegex.exec(html)) !== null) {
    const tagName = match[1].replace('/', '').toLowerCase();
    if (!allowedTags.includes(tagName)) {
      errors.push(`Invalid HTML tag: <${match[1]}>`);
    }
  }
  
  return errors;
}

/**
 * Schema validation utilities for common patterns
 */
export const ToolValidation = {
  /**
   * Validate task creation parameters
   */
  validateTaskCreation(params: unknown): CreateTaskParams {
    const result = CreateTaskSchema.safeParse(params);
    
    if (!result.success) {
      const errorDetails = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      throw new Error(
        `Task creation validation failed:\n${
          errorDetails.map(detail => `  - ${detail.field}: ${detail.message}`).join('\n')
        }`
      );
    }
    
    // Additional HTML validation if html_notes is provided
    if (result.data.html_notes) {
      const htmlErrors = validateAsanaHtml(result.data.html_notes);
      if (htmlErrors.length > 0) {
        throw new Error(
          `HTML validation failed:\n${htmlErrors.map(err => `  - ${err}`).join('\n')}`
        );
      }
    }
    
    return result.data;
  },

  /**
   * Validate comment/story creation parameters
   */
  validateStoryCreation(params: unknown): CreateTaskStoryParams {
    const result = CreateTaskStorySchema.safeParse(params);
    
    if (!result.success) {
      const errorDetails = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      throw new Error(
        `Story creation validation failed:\n${
          errorDetails.map(detail => `  - ${detail.field}: ${detail.message}`).join('\n')
        }`
      );
    }
    
    // Additional HTML validation if html_text is provided
    if (result.data.html_text) {
      const htmlErrors = validateAsanaHtml(result.data.html_text);
      if (htmlErrors.length > 0) {
        throw new Error(
          `HTML validation failed:\n${htmlErrors.map(err => `  - ${err}`).join('\n')}`
        );
      }
    }
    
    return result.data;
  },

  /**
   * Validate project status creation parameters
   */
  validateProjectStatusCreation(params: unknown): CreateProjectStatusParams {
    const result = CreateProjectStatusSchema.safeParse(params);
    
    if (!result.success) {
      const errorDetails = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      throw new Error(
        `Project status creation validation failed:\n${
          errorDetails.map(detail => `  - ${detail.field}: ${detail.message}`).join('\n')
        }`
      );
    }
    
    // Additional HTML validation if html_text is provided
    if (result.data.html_text) {
      const htmlErrors = validateAsanaHtml(result.data.html_text);
      if (htmlErrors.length > 0) {
        throw new Error(
          `HTML validation failed:\n${htmlErrors.map(err => `  - ${err}`).join('\n')}`
        );
      }
    }
    
    return result.data;
  }
};

// ============================================================================
// PHASE 3: BULK OPERATIONS SCHEMAS
// ============================================================================

/**
 * Schema for asana_update_multiple_tasks
 */
export const UpdateMultipleTasksSchema = z.object({
  task_ids: z.array(GidSchema)
    .min(1, 'At least one task ID required')
    .max(10, 'Maximum of 10 tasks per batch request (Asana API limitation)'),
  updates: z.object({
    name: z.string().optional(),
    notes: z.string().optional(),
    html_notes: z.string().optional(),
    completed: BooleanOrStringSchema.optional(),
    assignee: ValidationUtils.userIdOrMe.optional(),
    due_on: DateSchema.optional(),
    resource_subtype: ResourceSubtypeSchema.optional(),
    custom_fields: z.record(z.union([z.string(), z.number(), z.boolean()])).optional()
  }),
  opt_fields: OptFieldsSchema
});

/**
 * Schema for asana_execute_batch
 */
export const ExecuteBatchSchema = z.object({
  actions: z.array(z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
    relative_path: z.string().min(1, 'Relative path cannot be empty'),
    data: z.record(z.any()).optional(),
    headers: z.record(z.string()).optional()
  }))
    .min(1, 'At least one action required')
    .max(10, 'Maximum of 10 actions per batch request (Asana API limitation)'),
  opt_fields: OptFieldsSchema
});

/**
 * Schema for asana_create_multiple_tasks
 */
export const CreateMultipleTasksSchema = z.object({
  project_id: GidSchema,
  tasks: z.array(z.object({
    name: z.string().min(1, 'Task name cannot be empty'),
    notes: z.string().optional(),
    html_notes: z.string().optional(),
    assignee: ValidationUtils.userIdOrMe.optional(),
    due_on: DateSchema.optional(),
    followers: z.array(GidSchema).optional(),
    parent: GidSchema.optional(),
    resource_subtype: ResourceSubtypeSchema.optional(),
    custom_fields: z.record(z.union([z.string(), z.number(), z.boolean()])).optional()
  }))
    .min(1, 'At least one task required')
    .max(10, 'Maximum of 10 tasks per batch request (Asana API limitation)'),
  opt_fields: OptFieldsSchema
});

/**
 * Schema for asana_assign_multiple_tasks
 */
export const AssignMultipleTasksSchema = z.object({
  assignments: z.array(z.object({
    task_id: GidSchema,
    assignee: ValidationUtils.userIdOrMe
  }))
    .min(1, 'At least one assignment required')
    .max(10, 'Maximum of 10 assignments per batch request (Asana API limitation)'),
  opt_fields: OptFieldsSchema
});

/**
 * Schema for asana_complete_multiple_tasks
 */
export const CompleteMultipleTasksSchema = z.object({
  task_ids: z.array(GidSchema)
    .min(1, 'At least one task ID required')
    .max(10, 'Maximum of 10 tasks per batch request (Asana API limitation)'),
  completed: z.boolean(),
  opt_fields: OptFieldsSchema
});

// ============================================================================
// PHASE 3: GOALS AND PORTFOLIOS SCHEMAS
// ============================================================================

// Goals schemas temporarily disabled - uncomment to reactivate
// /**
//  * Schema for asana_get_goals
//  */
// export const GetGoalsSchema = z.object({
//   workspace: GidSchema,
//   team: GidSchema.optional(),
//   time_periods: z.array(GidSchema).optional(),
//   limit: z.union([z.number(), z.string().transform(Number)]).pipe(LimitSchema).optional(),
//   offset: z.string().optional(),
//   opt_fields: OptFieldsSchema
// });

/**
 * Schema for asana_get_portfolios
 */
export const GetPortfoliosSchema = z.object({
  workspace: GidSchema,
  owner: GidSchema.optional(),
  limit: z.union([z.number(), z.string().transform(Number)]).pipe(LimitSchema).optional(),
  offset: z.string().optional(),
  opt_fields: OptFieldsSchema
});

// ============================================================================
// PHASE 3 TYPE EXPORTS
// ============================================================================

export type UpdateMultipleTasksParams = z.infer<typeof UpdateMultipleTasksSchema>;
export type ExecuteBatchParams = z.infer<typeof ExecuteBatchSchema>;
export type CreateMultipleTasksParams = z.infer<typeof CreateMultipleTasksSchema>;
export type AssignMultipleTasksParams = z.infer<typeof AssignMultipleTasksSchema>;
export type CompleteMultipleTasksParams = z.infer<typeof CompleteMultipleTasksSchema>;

// Goals types temporarily disabled - uncomment to reactivate
// export type GetGoalsParams = z.infer<typeof GetGoalsSchema>;
export type GetPortfoliosParams = z.infer<typeof GetPortfoliosSchema>;