#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { WebClient } from "@slack/web-api";
import { z } from "zod";

// Environment validation
const configSchema = z.object({
  SLACK_BOT_TOKEN: z.string(),
  SLACK_TEAM_ID: z.string(),
  SLACK_CHANNEL_IDS: z.string().optional(),
});

const config = configSchema.parse(process.env);

// Initialize Slack client
const slack = new WebClient(config.SLACK_BOT_TOKEN);

// Tool definitions
const tools: Tool[] = [
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

// Server implementation
const server = new Server(
  {
    name: "slack-mcp-server",
    version: "1.0.0",
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
        
        // Filter to allowed channels if specified
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

      case "slack_reply_to_thread": {
        const { channel_id, thread_ts, text } = args as {
          channel_id: string;
          thread_ts: string;
          text: string;
        };

        const result = await slack.chat.postMessage({
          channel: channel_id,
          text,
          thread_ts,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ok: result.ok,
                channel: result.channel,
                ts: result.ts,
                thread_ts: result.message?.thread_ts,
              }, null, 2),
            },
          ],
        };
      }

      case "slack_add_reaction": {
        const { channel_id, timestamp, reaction } = args as {
          channel_id: string;
          timestamp: string;
          reaction: string;
        };

        const result = await slack.reactions.add({
          channel: channel_id,
          timestamp,
          name: reaction,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ok: result.ok,
                message: "Reaction added successfully",
              }, null, 2),
            },
          ],
        };
      }

      case "slack_get_channel_history": {
        const { channel_id, limit = 10 } = args as {
          channel_id: string;
          limit?: number;
        };

        const result = await slack.conversations.history({
          channel: channel_id,
          limit,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                messages: result.messages?.map(message => ({
                  type: message.type,
                  user: message.user,
                  text: message.text,
                  ts: message.ts,
                  thread_ts: message.thread_ts,
                  reply_count: message.reply_count,
                })),
                has_more: result.has_more,
                response_metadata: result.response_metadata,
              }, null, 2),
            },
          ],
        };
      }

      case "slack_get_thread_replies": {
        const { channel_id, thread_ts } = args as {
          channel_id: string;
          thread_ts: string;
        };

        const result = await slack.conversations.replies({
          channel: channel_id,
          ts: thread_ts,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                messages: result.messages?.map(message => ({
                  type: message.type,
                  user: message.user,
                  text: message.text,
                  ts: message.ts,
                  thread_ts: message.thread_ts,
                })),
                has_more: result.has_more,
              }, null, 2),
            },
          ],
        };
      }

      case "slack_get_users": {
        const { cursor, limit = 100 } = args as {
          cursor?: string;
          limit?: number;
        };

        const result = await slack.users.list({
          cursor,
          limit,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                members: result.members?.map(member => ({
                  id: member.id,
                  name: member.name,
                  real_name: member.real_name,
                  display_name: member.profile?.display_name,
                  email: member.profile?.email,
                  is_bot: member.is_bot,
                  is_app_user: member.is_app_user,
                  deleted: member.deleted,
                })),
                response_metadata: result.response_metadata,
              }, null, 2),
            },
          ],
        };
      }

      case "slack_get_user_profile": {
        const { user_id } = args as {
          user_id: string;
        };

        const result = await slack.users.profile.get({
          user: user_id,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                profile: {
                  avatar_hash: result.profile?.avatar_hash,
                  status_text: result.profile?.status_text,
                  status_emoji: result.profile?.status_emoji,
                  real_name: result.profile?.real_name,
                  display_name: result.profile?.display_name,
                  real_name_normalized: result.profile?.real_name_normalized,
                  display_name_normalized: result.profile?.display_name_normalized,
                  email: result.profile?.email,
                  image_24: result.profile?.image_24,
                  image_32: result.profile?.image_32,
                  image_48: result.profile?.image_48,
                  image_72: result.profile?.image_72,
                  image_192: result.profile?.image_192,
                  image_512: result.profile?.image_512,
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
  console.error("Slack MCP server running on stdio");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}