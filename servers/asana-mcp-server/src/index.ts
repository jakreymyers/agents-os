#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { VERSION } from './version.js';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { tool_handler, list_of_tools } from './tool-handler.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { AsanaClientWrapper } from './asana-client-wrapper.js'
import { createPromptHandlers } from './prompt-handler.js';
import { createResourceHandlers } from './resource-handler.js';

async function main() {
  const asanaToken = process.env.ASANA_ACCESS_TOKEN;
  const readOnlyMode = process.env.ASANA_READ_ONLY === 'true';

  if (!asanaToken) {
    console.error("Error: ASANA_ACCESS_TOKEN environment variable is required");
    console.error("Please set your Asana access token before starting the server");
    process.exit(1);
  }

  console.error("Starting Enhanced Asana MCP Server...");
  console.error(`Configuration: ${readOnlyMode ? 'Read-Only Mode' : 'Full Access Mode'}`);
  const server = new Server(
    {
      name: "Enhanced Asana MCP Server",
      version: VERSION,
    },
    {
      capabilities: {
        tools: {},
        prompts: {},
        resources: {}
      },
    }
  );

  const asanaClient = new AsanaClientWrapper(asanaToken, readOnlyMode);

  server.setRequestHandler(
    CallToolRequestSchema,
    tool_handler(asanaClient)
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error("Received ListToolsRequest");
    return {
      tools: list_of_tools,
    };
  });

  const promptHandlers = createPromptHandlers(asanaClient);

  // Add prompt handlers
  server.setRequestHandler(ListPromptsRequestSchema, promptHandlers.listPrompts);
  server.setRequestHandler(GetPromptRequestSchema, promptHandlers.getPrompt);

  // Add resource handlers
  const resourceHandlers = createResourceHandlers(asanaClient);
  server.setRequestHandler(ListResourcesRequestSchema, resourceHandlers.listResources);
  server.setRequestHandler(ListResourceTemplatesRequestSchema, resourceHandlers.listResourceTemplates);
  server.setRequestHandler(ReadResourceRequestSchema, resourceHandlers.readResource);

  const transport = new StdioServerTransport();
  console.error("Connecting server to transport...");
  await server.connect(transport);

  console.error("Enhanced Asana MCP Server running on stdio");
  console.error("Available tools:", list_of_tools.length);
  console.error("Server ready to handle requests...");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
