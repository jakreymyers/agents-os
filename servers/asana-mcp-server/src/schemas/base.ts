import { z } from 'zod';

/**
 * Base validation schemas for Asana MCP Server
 * These provide fundamental validation for common Asana data types
 */

/**
 * Validates Asana Global Identifiers (GIDs)
 * Asana GIDs are numeric strings of variable length
 */
export const GidSchema = z.string().regex(/^\d+$/, 'Must be a valid Asana GID (numeric string)');

/**
 * Validates ISO 8601 date strings (YYYY-MM-DD)
 * Used for due dates, created dates, etc.
 */
export const DateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Must be ISO 8601 date format (YYYY-MM-DD)'
);

/**
 * Validates ISO 8601 datetime strings
 * Supports both with and without timezone information
 */
export const DateTimeSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/,
  'Must be ISO 8601 datetime format (YYYY-MM-DDTHH:MM:SS[.sss][Z|±HH:MM])'
);

/**
 * Transforms comma-separated strings into arrays of trimmed strings
 * Filters out empty strings
 * Example: "123, 456, 789" → ["123", "456", "789"]
 */
export const CommaListSchema = z.string().transform(str => 
  str.split(',').map(s => s.trim()).filter(Boolean)
);

/**
 * Validates comma-separated lists of GIDs
 * Combines CommaListSchema with GID validation for each item
 */
export const GidListSchema = CommaListSchema.pipe(
  z.array(GidSchema)
);

/**
 * Optional GID schema - allows empty strings or valid GIDs
 */
export const OptionalGidSchema = z.string().refine(
  val => val === '' || /^\d+$/.test(val),
  'Must be empty or a valid Asana GID'
);

/**
 * Email validation for Asana user references
 */
export const EmailSchema = z.string().email('Must be a valid email address');

/**
 * Validates Asana opt_fields parameter
 * Allows comma-separated field names including nested fields with dots
 */
export const OptFieldsSchema = z.string().regex(
  /^[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*(?:,[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)*$/,
  'Must be comma-separated field names (supports nested fields with dots)'
).optional();

/**
 * Sort order validation for Asana API
 */
export const SortBySchema = z.enum([
  'due_date', 
  'created_at', 
  'completed_at', 
  'likes', 
  'modified_at'
]);

/**
 * Boolean schema that also accepts string representations
 */
export const BooleanOrStringSchema = z.union([
  z.boolean(),
  z.string().transform(val => val.toLowerCase() === 'true')
]);

/**
 * Validates limit parameter for pagination (1-100)
 */
export const LimitSchema = z.number().int().min(1).max(100);

/**
 * Validates Asana resource subtypes
 */
export const ResourceSubtypeSchema = z.enum([
  'default_task',
  'milestone',
  'section',
  'approval'
]);

/**
 * Custom field operations for search
 */
export const CustomFieldOperationSchema = z.enum([
  'is_set',
  'value', 
  'contains',
  'starts_with',
  'ends_with',
  'less_than',
  'greater_than'
]);

/**
 * Schema for custom field filters in search
 * Supports the format: { "field_gid": { "operation": "value" } }
 */
export const CustomFieldsSchema = z.record(
  GidSchema, // field GID
  z.record(
    CustomFieldOperationSchema, // operation
    z.union([z.string(), z.number(), z.boolean()]) // value
  )
).optional();

/**
 * Project status colors
 */
export const ProjectStatusColorSchema = z.enum(['green', 'yellow', 'red']);

/**
 * Common validation utilities
 */
export const ValidationUtils = {
  /**
   * Validates that a string is either 'me' or a valid GID
   */
  userIdOrMe: z.string().refine(
    val => val === 'me' || /^\d+$/.test(val),
    'Must be "me" or a valid Asana GID'
  ),

  /**
   * Validates comma-separated list of user IDs or 'me'
   */
  userIdListOrMe: CommaListSchema.pipe(
    z.array(z.string().refine(
      val => val === 'me' || /^\d+$/.test(val),
      'Must be "me" or a valid Asana GID'
    ))
  ),

  /**
   * Validates that at least one of text or html_text is provided
   */
  textOrHtmlText: z.object({
    text: z.string().optional(),
    html_text: z.string().optional()
  }).refine(
    data => data.text || data.html_text,
    { message: "Either 'text' or 'html_text' must be provided" }
  )
};

/**
 * Type helpers for schema inference
 */
export type GidType = z.infer<typeof GidSchema>;
export type DateType = z.infer<typeof DateSchema>;
export type DateTimeType = z.infer<typeof DateTimeSchema>;
export type OptFieldsType = z.infer<typeof OptFieldsSchema>;
export type CustomFieldsType = z.infer<typeof CustomFieldsSchema>;