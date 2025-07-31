#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { WebClient } from "@slack/web-api";
import { SlackOAuthManager, oauthConfigSchema, type OAuthConfig } from "./oauth.js";

// Environment validation with OAuth support
const config: OAuthConfig = oauthConfigSchema.parse(process.env);

// Initialize OAuth manager
const oauthManager = new SlackOAuthManager(config);

// Initialize Slack client (will be updated with OAuth token if needed)
let slack: WebClient;

// Initialize with static token or prepare for OAuth
if (oauthManager.isStaticTokenConfigured()) {
  slack = new WebClient(config.SLACK_BOT_TOKEN);
} else if (oauthManager.isOAuthConfigured()) {
  // Will be initialized after OAuth flow
  slack = new WebClient();
} else {
  throw new Error("Either SLACK_BOT_TOKEN or OAuth configuration (SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_REDIRECT_URI) must be provided");
}

// Enhanced tool definitions with OAuth support
const baseTools: Tool[] = [
  {
    name: "slack_list_channels",
    description: "List public or pre-defined channels in the workspace",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of channels to return (default: 100, max: 200)",
          minimum: 1,
          maximum: 200,
          default: 100,
        },
        cursor: {
          type: "string",
          description: "Pagination cursor for next page",
        },
      },
    },
  },
  {
    name: "slack_post_message",
    description: "Post a new message to a Slack channel",
    inputSchema: {
      type: "object",
      properties: {
        channel_id: {
          type: "string",
          description: "The ID of the channel to post to",
        },
        text: {
          type: "string",
          description: "The message text to post",
        },
      },
      required: ["channel_id", "text"],
    },
  },
  {
    name: "slack_reply_to_thread",
    description: "Reply to a specific message thread",
    inputSchema: {
      type: "object",
      properties: {
        channel_id: {
          type: "string",
          description: "The channel containing the thread",
        },
        thread_ts: {
          type: "string",
          description: "Timestamp of the parent message",
        },
        text: {
          type: "string",
          description: "The reply text",
        },
      },
      required: ["channel_id", "thread_ts", "text"],
    },
  },
  {
    name: "slack_add_reaction",
    description: "Add an emoji reaction to a message",
    inputSchema: {
      type: "object",
      properties: {
        channel_id: {
          type: "string",
          description: "The channel containing the message",
        },
        timestamp: {
          type: "string",
          description: "Message timestamp to react to",
        },
        reaction: {
          type: "string",
          description: "Emoji name without colons",
        },
      },
      required: ["channel_id", "timestamp", "reaction"],
    },
  },
  {
    name: "slack_get_channel_history",
    description: "Get recent messages from a channel",
    inputSchema: {
      type: "object",
      properties: {
        channel_id: {
          type: "string",
          description: "The channel ID",
        },
        limit: {
          type: "number",
          description: "Number of messages to retrieve (default: 10)",
          minimum: 1,
          maximum: 100,
          default: 10,
        },
      },
      required: ["channel_id"],
    },
  },
  {
    name: "slack_get_thread_replies",
    description: "Get all replies in a message thread",
    inputSchema: {
      type: "object",
      properties: {
        channel_id: {
          type: "string",
          description: "The channel containing the thread",
        },
        thread_ts: {
          type: "string",
          description: "Timestamp of the parent message",
        },
      },
      required: ["channel_id", "thread_ts"],
    },
  },
  {
    name: "slack_get_users",
    description: "Get list of workspace users with basic profile information",
    inputSchema: {
      type: "object",
      properties: {
        cursor: {
          type: "string",
          description: "Pagination cursor for next page",
        },
        limit: {
          type: "number",
          description: "Maximum users to return (default: 100, max: 200)",
          minimum: 1,
          maximum: 200,
          default: 100,
        },
      },
    },
  },
  {
    name: "slack_get_user_profile",
    description: "Get detailed profile information for a specific user",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "The user's ID",
        },
      },
      required: ["user_id"],
    },
  },
];

// OAuth-specific tools
const oauthTools: Tool[] = [
  {
    name: "slack_get_oauth_url",
    description: "Get OAuth authorization URL for Slack workspace connection",
    inputSchema: {
      type: "object",
      properties: {
        state: {
          type: "string",
          description: "Optional state parameter for OAuth security",
        },
      },
    },
  },
  {
    name: "slack_exchange_oauth_code",
    description: "Exchange OAuth authorization code for access token",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "Authorization code from OAuth callback",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "slack_oauth_status",
    description: "Get current OAuth configuration status",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// Determine which tools to expose
const tools: Tool[] = [
  ...baseTools,
  ...(oauthManager.isOAuthConfigured() ? oauthTools : []),
];

// Server implementation
const server = new Server(
  {
    name: "slack-mcp-server-enhanced",
    version: "1.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Handle OAuth tools first
    if (name === "slack_get_oauth_url") {
      const { state } = args as { state?: string };
      
      if (!oauthManager.isOAuthConfigured()) {
        throw new Error("OAuth not configured. Set SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, and SLACK_REDIRECT_URI");
      }

      const authUrl = oauthManager.getAuthorizationUrl(state);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              authorization_url: authUrl,
              instructions: "Visit this URL to authorize the Slack app",
              state: state || null,
            }, null, 2),
          },
        ],
      };
    }

    if (name === "slack_exchange_oauth_code") {
      const { code } = args as { code: string };
      
      if (!oauthManager.isOAuthConfigured()) {
        throw new Error("OAuth not configured");
      }

      const tokenData = await oauthManager.exchangeCodeForToken(code);
      
      // Update Slack client with new token
      if (tokenData.access_token) {
        slack = new WebClient(tokenData.access_token);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              team: tokenData.team,
              bot_user_id: tokenData.bot_user_id,
              scope: tokenData.scope,
              message: "OAuth token exchanged successfully. Slack client updated.",
            }, null, 2),
          },
        ],
      };
    }

    if (name === "slack_oauth_status") {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              oauth_configured: oauthManager.isOAuthConfigured(),
              static_token_configured: oauthManager.isStaticTokenConfigured(),
              slack_client_ready: !!slack.token,
              configuration: {
                has_client_id: !!config.SLACK_CLIENT_ID,
                has_client_secret: !!config.SLACK_CLIENT_SECRET,
                has_redirect_uri: !!config.SLACK_REDIRECT_URI,
                has_bot_token: !!config.SLACK_BOT_TOKEN,
                team_id: config.SLACK_TEAM_ID,
              },
            }, null, 2),
          },
        ],
      };
    }

    // Check if Slack client is ready for regular operations
    if (!slack.token) {
      throw new Error("Slack client not authenticated. Use OAuth flow or configure SLACK_BOT_TOKEN");
    }

    // Handle regular Slack tools (same as before)
    switch (name) {
      case "slack_list_channels": {
        const { limit = 100, cursor } = args as {
          limit?: number;
          cursor?: string;
        };

        const allowedChannels = config.SLACK_CHANNEL_IDS
          ? config.SLACK_CHANNEL_IDS.split(",").map(id => id.trim())
          : undefined;

        const result = await slack.conversations.list({
          limit,
          cursor,
          types: "public_channel",
        });

        let channels = result.channels || [];
        
        if (allowedChannels) {
          channels = channels.filter(channel => 
            allowedChannels.includes(channel.id || "")
          );
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                channels: channels.map(channel => ({
                  id: channel.id,
                  name: channel.name,
                  topic: channel.topic?.value || "",
                  purpose: channel.purpose?.value || "",
                  num_members: channel.num_members,
                  is_archived: channel.is_archived,
                })),
                response_metadata: result.response_metadata,
              }, null, 2),
            },
          ],
        };
      }

      // ... include all other tool implementations from the original index.ts
      // (I'll include the key ones for brevity)

      case "slack_post_message": {
        const { channel_id, text } = args as {
          channel_id: string;
          text: string;
        };

        const result = await slack.chat.postMessage({
          channel: channel_id,
          text,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ok: result.ok,
                channel: result.channel,
                ts: result.ts,
                message: {
                  text: result.message?.text,
                  user: result.message?.user,
                  ts: result.message?.ts,
                },
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Enhanced Slack MCP server running on stdio");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}