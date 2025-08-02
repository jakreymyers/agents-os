/**
 * Bulk Operations Tools for Asana MCP Server Phase 3
 * 
 * Implements batch operations using Asana's /batch endpoint
 * Maximum of 10 actions per request (Asana API limitation)
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * Tool for updating multiple tasks with the same changes
 * Uses Asana's batch API for efficiency
 */
export const updateMultipleTasksTool: Tool = {
  name: "asana_update_multiple_tasks",
  description: "Update multiple tasks with the same changes using Asana's batch API. Maximum of 10 tasks per request.",
  inputSchema: {
    type: "object",
    properties: {
      task_ids: {
        type: "array",
        items: { 
          type: "string",
          pattern: "^\\d+$",
          description: "Task GID (numeric string)"
        },
        minItems: 1,
        maxItems: 10,
        description: "Array of task GIDs to update (maximum 10 tasks per batch)"
      },
      updates: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "New task name"
          },
          notes: {
            type: "string", 
            description: "New task description"
          },
          html_notes: {
            type: "string",
            description: "HTML-formatted task description"
          },
          completed: {
            type: "boolean",
            description: "Mark task as completed/incomplete"
          },
          assignee: {
            type: "string",
            description: "New assignee GID or 'me'"
          },
          due_on: {
            type: "string",
            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            description: "Due date in YYYY-MM-DD format"
          },
          resource_subtype: {
            type: "string",
            enum: ["default_task", "milestone"],
            description: "Task type"
          },
          custom_fields: {
            type: "object",
            description: "Custom field updates as key-value pairs"
          }
        },
        additionalProperties: false,
        description: "Changes to apply to all specified tasks"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include in response"
      }
    },
    required: ["task_ids", "updates"]
  }
};

/**
 * Tool for executing custom batch operations
 * Allows for advanced batch requests with multiple action types
 */
export const executeBatchTool: Tool = {
  name: "asana_execute_batch",
  description: "Execute multiple API operations in a single batch request. Maximum of 10 actions per batch.",
  inputSchema: {
    type: "object",
    properties: {
      actions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            method: {
              type: "string",
              enum: ["GET", "POST", "PUT", "DELETE"],
              description: "HTTP method for the action"
            },
            relative_path: {
              type: "string",
              description: "Relative API path (e.g., '/tasks/123456')"
            },
            data: {
              type: "object",
              description: "Request body data for POST/PUT operations"
            },
            headers: {
              type: "object",
              description: "Optional headers for the request"
            }
          },
          required: ["method", "relative_path"],
          additionalProperties: false
        },
        minItems: 1,
        maxItems: 10,
        description: "Array of API actions to execute (maximum 10 actions per batch)"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include in response"
      }
    },
    required: ["actions"]
  }
};

/**
 * Tool for bulk task creation
 * Creates multiple tasks in a single batch request
 */
export const createMultipleTasksTool: Tool = {
  name: "asana_create_multiple_tasks",
  description: "Create multiple tasks in a single batch request. Maximum of 10 tasks per batch.",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        pattern: "^\\d+$",
        description: "Project GID where all tasks will be created"
      },
      tasks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              minLength: 1,
              description: "Task name (required)"
            },
            notes: {
              type: "string",
              description: "Task description"
            },
            html_notes: {
              type: "string",
              description: "HTML-formatted task description"
            },
            assignee: {
              type: "string",
              description: "Assignee GID or 'me'"
            },
            due_on: {
              type: "string",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
              description: "Due date in YYYY-MM-DD format"
            },
            followers: {
              type: "array",
              items: { type: "string" },
              description: "Array of follower GIDs"
            },
            parent: {
              type: "string",
              description: "Parent task GID for subtasks"
            },
            resource_subtype: {
              type: "string",
              enum: ["default_task", "milestone"],
              description: "Task type"
            },
            custom_fields: {
              type: "object",
              description: "Custom field values as key-value pairs"
            }
          },
          required: ["name"],
          additionalProperties: false
        },
        minItems: 1,
        maxItems: 10,
        description: "Array of task objects to create (maximum 10 tasks per batch)"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include in response"
      }
    },
    required: ["project_id", "tasks"]
  }
};

/**
 * Tool for bulk task assignment
 * Assigns multiple tasks to different users efficiently
 */
export const assignMultipleTasksTool: Tool = {
  name: "asana_assign_multiple_tasks",
  description: "Assign multiple tasks to users in a single batch request. Maximum of 10 assignments per batch.",
  inputSchema: {
    type: "object",
    properties: {
      assignments: {
        type: "array",
        items: {
          type: "object",
          properties: {
            task_id: {
              type: "string",
              pattern: "^\\d+$",
              description: "Task GID to assign"
            },
            assignee: {
              type: "string",
              description: "Assignee GID or 'me'"
            }
          },
          required: ["task_id", "assignee"],
          additionalProperties: false
        },
        minItems: 1,
        maxItems: 10,
        description: "Array of task-assignee pairs (maximum 10 assignments per batch)"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include in response"
      }
    },
    required: ["assignments"]
  }
};

/**
 * Tool for bulk task completion
 * Mark multiple tasks as completed or incomplete efficiently
 */
export const completeMultipleTasksTool: Tool = {
  name: "asana_complete_multiple_tasks",
  description: "Mark multiple tasks as completed or incomplete in a single batch request. Maximum of 10 tasks per batch.",
  inputSchema: {
    type: "object",
    properties: {
      task_ids: {
        type: "array",
        items: { 
          type: "string",
          pattern: "^\\d+$",
          description: "Task GID (numeric string)"
        },
        minItems: 1,
        maxItems: 10,
        description: "Array of task GIDs to update (maximum 10 tasks per batch)"
      },
      completed: {
        type: "boolean",
        description: "True to mark as completed, false to mark as incomplete"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include in response"
      }
    },
    required: ["task_ids", "completed"]
  }
};