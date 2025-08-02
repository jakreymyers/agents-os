/**
 * Portfolios API Tools for Asana MCP Server Phase 3
 * 
 * Implements Asana Portfolios API endpoints (verified active and functional)
 * Supports portfolio management with pagination and custom fields
 * Note: Portfolios have max 1500 items and 20 custom fields per portfolio
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * Tool for getting portfolios from a workspace
 * Supports filtering by owner and pagination
 */
export const getPortfoliosTool: Tool = {
  name: "asana_get_portfolios",
  description: "Get portfolios from a workspace with optional filtering by owner and pagination support",
  inputSchema: {
    type: "object",
    properties: {
      workspace: {
        type: "string",
        pattern: "^\\d+$",
        description: "The workspace GID to get portfolios from"
      },
      owner: {
        type: "string",
        description: "Optional: Filter portfolios by owner GID or 'me'"
      },
      limit: {
        type: "integer",
        minimum: 1,
        maximum: 100,
        description: "Number of portfolios per page (1-100, default 20)"
      },
      offset: {
        type: "string",
        description: "Pagination offset token from previous response"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include (e.g., 'name,owner,color,workspace,public,created_at')"
      }
    },
    required: ["workspace"]
  }
};

/**
 * Tool for getting a specific portfolio by ID
 */
export const getPortfolioTool: Tool = {
  name: "asana_get_portfolio",
  description: "Get detailed information about a specific portfolio",
  inputSchema: {
    type: "object",
    properties: {
      portfolio_gid: {
        type: "string",
        pattern: "^\\d+$",
        description: "The portfolio GID to retrieve"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include"
      }
    },
    required: ["portfolio_gid"]
  }
};

/**
 * Tool for creating a new portfolio
 */
export const createPortfolioTool: Tool = {
  name: "asana_create_portfolio",
  description: "Create a new portfolio in a workspace",
  inputSchema: {
    type: "object",
    properties: {
      workspace: {
        type: "string",
        pattern: "^\\d+$",
        description: "The workspace GID where the portfolio will be created"
      },
      name: {
        type: "string",
        minLength: 1,
        description: "The name of the portfolio"
      },
      color: {
        type: "string",
        enum: [
          "dark-pink", "dark-green", "dark-blue", "dark-red", "dark-teal", 
          "dark-brown", "dark-orange", "dark-purple", "dark-warm-gray", 
          "light-pink", "light-green", "light-blue", "light-red", "light-teal", 
          "light-brown", "light-orange", "light-purple", "light-warm-gray"
        ],
        description: "Optional: Color theme for the portfolio"
      },
      public: {
        type: "boolean",
        description: "Optional: Whether the portfolio is public (true) or private (false)"
      },
      owner: {
        type: "string",
        description: "Optional: The user GID who will own this portfolio, or 'me'"
      },
      start_on: {
        type: "string",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
        description: "Optional: Start date in YYYY-MM-DD format"
      },
      due_on: {
        type: "string",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
        description: "Optional: Due date in YYYY-MM-DD format"
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
 * Tool for updating an existing portfolio
 */
export const updatePortfolioTool: Tool = {
  name: "asana_update_portfolio",
  description: "Update an existing portfolio's properties",
  inputSchema: {
    type: "object",
    properties: {
      portfolio_gid: {
        type: "string",
        pattern: "^\\d+$",
        description: "The portfolio GID to update"
      },
      name: {
        type: "string",
        description: "New name for the portfolio"
      },
      color: {
        type: "string",
        enum: [
          "dark-pink", "dark-green", "dark-blue", "dark-red", "dark-teal", 
          "dark-brown", "dark-orange", "dark-purple", "dark-warm-gray", 
          "light-pink", "light-green", "light-blue", "light-red", "light-teal", 
          "light-brown", "light-orange", "light-purple", "light-warm-gray"
        ],
        description: "New color theme for the portfolio"
      },
      public: {
        type: "boolean",
        description: "Update privacy setting"
      },
      start_on: {
        type: "string",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
        description: "New start date in YYYY-MM-DD format"
      },
      due_on: {
        type: "string",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
        description: "New due date in YYYY-MM-DD format"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include in response"
      }
    },
    required: ["portfolio_gid"]
  }
};

/**
 * Tool for deleting a portfolio
 */
export const deletePortfolioTool: Tool = {
  name: "asana_delete_portfolio",
  description: "Delete a portfolio (requires appropriate permissions)",
  inputSchema: {
    type: "object",
    properties: {
      portfolio_gid: {
        type: "string",
        pattern: "^\\d+$",
        description: "The portfolio GID to delete"
      }
    },
    required: ["portfolio_gid"]
  }
};

/**
 * Tool for getting items (projects) in a portfolio
 */
export const getPortfolioItemsTool: Tool = {
  name: "asana_get_portfolio_items",
  description: "Get items (projects) in a portfolio with pagination support",
  inputSchema: {
    type: "object",
    properties: {
      portfolio_gid: {
        type: "string",
        pattern: "^\\d+$",
        description: "The portfolio GID to get items from"
      },
      limit: {
        type: "integer",
        minimum: 1,
        maximum: 100,
        description: "Number of items per page (1-100, default 20)"
      },
      offset: {
        type: "string",
        description: "Pagination offset token from previous response"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include"
      }
    },
    required: ["portfolio_gid"]
  }
};

/**
 * Tool for adding items (projects) to a portfolio
 * Note: Portfolios have a maximum of 1500 items
 */
export const addPortfolioItemsTool: Tool = {
  name: "asana_add_portfolio_items",
  description: "Add items (projects) to a portfolio. Maximum 1500 items per portfolio.",
  inputSchema: {
    type: "object",
    properties: {
      portfolio_gid: {
        type: "string",
        pattern: "^\\d+$",
        description: "The portfolio GID to add items to"
      },
      items: {
        type: "array",
        items: {
          type: "string",
          pattern: "^\\d+$",
          description: "Project GID"
        },
        minItems: 1,
        description: "Array of project GIDs to add to the portfolio"
      },
      insert_before: {
        type: "string",
        pattern: "^\\d+$",
        description: "Optional: Insert before this item GID"
      },
      insert_after: {
        type: "string",
        pattern: "^\\d+$",
        description: "Optional: Insert after this item GID"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include in response"
      }
    },
    required: ["portfolio_gid", "items"]
  }
};

/**
 * Tool for removing items from a portfolio
 */
export const removePortfolioItemsTool: Tool = {
  name: "asana_remove_portfolio_items",
  description: "Remove items (projects) from a portfolio",
  inputSchema: {
    type: "object",
    properties: {
      portfolio_gid: {
        type: "string",
        pattern: "^\\d+$",
        description: "The portfolio GID to remove items from"
      },
      items: {
        type: "array",
        items: {
          type: "string",
          pattern: "^\\d+$",
          description: "Project GID"
        },
        minItems: 1,
        description: "Array of project GIDs to remove from the portfolio"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include in response"
      }
    },
    required: ["portfolio_gid", "items"]
  }
};

/**
 * Tool for adding members to a portfolio
 */
export const addPortfolioMembersTool: Tool = {
  name: "asana_add_portfolio_members",
  description: "Add members to a portfolio for collaboration",
  inputSchema: {
    type: "object",
    properties: {
      portfolio_gid: {
        type: "string",
        pattern: "^\\d+$",
        description: "The portfolio GID to add members to"
      },
      members: {
        type: "array",
        items: {
          type: "string",
          description: "User GID or 'me'"
        },
        minItems: 1,
        description: "Array of user GIDs to add as members"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include in response"
      }
    },
    required: ["portfolio_gid", "members"]
  }
};

/**
 * Tool for removing members from a portfolio
 */
export const removePortfolioMembersTool: Tool = {
  name: "asana_remove_portfolio_members",
  description: "Remove members from a portfolio",
  inputSchema: {
    type: "object",
    properties: {
      portfolio_gid: {
        type: "string",
        pattern: "^\\d+$",
        description: "The portfolio GID to remove members from"
      },
      members: {
        type: "array",
        items: {
          type: "string",
          description: "User GID"
        },
        minItems: 1,
        description: "Array of user GIDs to remove as members"
      },
      opt_fields: {
        type: "string",
        description: "Comma-separated list of optional fields to include in response"
      }
    },
    required: ["portfolio_gid", "members"]
  }
};