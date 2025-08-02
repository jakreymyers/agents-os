/**
 * Goals API Tools for Asana MCP Server Phase 3
 * 
 * Implements Asana Goals API endpoints (verified active and functional)
 * Supports workspace and team-level goal management with pagination
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * Tool for getting goals from a workspace or team
 * Supports filtering by team and time periods
 */
export const getGoalsTool: Tool = {
  name: "asana_get_goals",
  description: "Get goals from a workspace or team with optional filtering by time periods and pagination support",
  inputSchema: {
    type: "object",
    properties: {
      workspace: {
        type: "string",
        pattern: "^\\d+$",
        description: "The workspace GID to get goals from"
      },
      team: {
        type: "string",
        pattern: "^\\d+$",
        description: "Optional: Filter goals by team GID"
      },
      time_periods: {
        type: "array",
        items: {
          type: "string",
          pattern: "^\\d+$"
        },
        description: "Optional: Filter by time period GIDs"
      },
      limit: {
        type: "integer",
        minimum: 1,
        maximum: 100,
        description: "Number of goals per page (1-100, default 20)"
      },
      offset: {
        type: "string",
        description: "Pagination offset token from previous response"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include (e.g., 'name,owner,status,metric,time_period,workspace')"
      }
    },
    required: ["workspace"]
  }
};

/**
 * Tool for getting a specific goal by ID
 */
export const getGoalTool: Tool = {
  name: "asana_get_goal",
  description: "Get detailed information about a specific goal",
  inputSchema: {
    type: "object",
    properties: {
      goal_gid: {
        type: "string",
        pattern: "^\\d+$",
        description: "The goal GID to retrieve"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include"
      }
    },
    required: ["goal_gid"]
  }
};

/**
 * Tool for creating a new goal
 * Note: Requires appropriate permissions in the workspace
 */
export const createGoalTool: Tool = {
  name: "asana_create_goal",
  description: "Create a new goal in a workspace or team",
  inputSchema: {
    type: "object",
    properties: {
      workspace: {
        type: "string",
        pattern: "^\\d+$",
        description: "The workspace GID where the goal will be created"
      },
      name: {
        type: "string",
        minLength: 1,
        description: "The name of the goal"
      },
      owner: {
        type: "string",
        description: "The user GID who will own this goal, or 'me'"
      },
      team: {
        type: "string",
        pattern: "^\\d+$",
        description: "Optional: The team GID this goal belongs to"
      },
      time_period: {
        type: "string",
        pattern: "^\\d+$",
        description: "Optional: The time period GID this goal is for"
      },
      notes: {
        type: "string",
        description: "Optional: Description or notes about the goal"
      },
      html_notes: {
        type: "string",
        description: "Optional: HTML-formatted description of the goal"
      },
      metric: {
        type: "object",
        properties: {
          unit: {
            type: "string",
            description: "The unit of measurement (e.g., 'currency', 'percentage', 'number')"
          },
          target_number: {
            type: "number",
            description: "The target value to achieve"
          },
          initial_number: {
            type: "number",
            description: "The starting/baseline value"
          },
          current_number: {
            type: "number",
            description: "The current progress value"
          }
        },
        description: "Optional: Quantitative metrics for the goal"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include in response"
      }
    },
    required: ["workspace", "name"]
  }
};

/**
 * Tool for updating an existing goal
 */
export const updateGoalTool: Tool = {
  name: "asana_update_goal",
  description: "Update an existing goal's properties",
  inputSchema: {
    type: "object",
    properties: {
      goal_gid: {
        type: "string",
        pattern: "^\\d+$",
        description: "The goal GID to update"
      },
      name: {
        type: "string",
        description: "New name for the goal"
      },
      notes: {
        type: "string",
        description: "New description or notes"
      },
      html_notes: {
        type: "string",
        description: "New HTML-formatted description"
      },
      status: {
        type: "string",
        enum: ["green", "yellow", "red", "closed"],
        description: "Update the goal status"
      },
      metric: {
        type: "object",
        properties: {
          unit: {
            type: "string",
            description: "The unit of measurement"
          },
          target_number: {
            type: "number",
            description: "The target value to achieve"
          },
          current_number: {
            type: "number",
            description: "The current progress value"
          }
        },
        description: "Update quantitative metrics"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include in response"
      }
    },
    required: ["goal_gid"]
  }
};

/**
 * Tool for deleting a goal
 */
export const deleteGoalTool: Tool = {
  name: "asana_delete_goal",
  description: "Delete a goal (requires appropriate permissions)",
  inputSchema: {
    type: "object",
    properties: {
      goal_gid: {
        type: "string",
        pattern: "^\\d+$",
        description: "The goal GID to delete"
      }
    },
    required: ["goal_gid"]
  }
};

/**
 * Tool for adding supporters/collaborators to a goal
 */
export const addGoalSupportersTool: Tool = {
  name: "asana_add_goal_supporters",
  description: "Add supporters/collaborators to a goal",
  inputSchema: {
    type: "object",
    properties: {
      goal_gid: {
        type: "string",
        pattern: "^\\d+$",
        description: "The goal GID to add supporters to"
      },
      supporters: {
        type: "array",
        items: {
          type: "string",
          description: "User GID or 'me'"
        },
        minItems: 1,
        description: "Array of user GIDs to add as supporters"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include in response"
      }
    },
    required: ["goal_gid", "supporters"]
  }
};

/**
 * Tool for removing supporters from a goal
 */
export const removeGoalSupportersTool: Tool = {
  name: "asana_remove_goal_supporters",
  description: "Remove supporters/collaborators from a goal",
  inputSchema: {
    type: "object",
    properties: {
      goal_gid: {
        type: "string",
        pattern: "^\\d+$",
        description: "The goal GID to remove supporters from"
      },
      supporters: {
        type: "array",
        items: {
          type: "string",
          description: "User GID"
        },
        minItems: 1,
        description: "Array of user GIDs to remove as supporters"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include in response"
      }
    },
    required: ["goal_gid", "supporters"]
  }
};

/**
 * Tool for getting parent goals of a specific goal
 */
export const getParentGoalsTool: Tool = {
  name: "asana_get_parent_goals",
  description: "Get the parent goals for a specific goal",
  inputSchema: {
    type: "object",
    properties: {
      goal_gid: {
        type: "string",
        pattern: "^\\d+$",
        description: "The goal GID to get parents for"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include"
      }
    },
    required: ["goal_gid"]
  }
};