# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agents OS is a collection of MCP (Model Context Protocol) servers that power AI agent teams. The project provides integrations with Airtable, Asana, and Slack through dedicated MCP servers.

## Architecture

```
agents-os/
├── servers/                    # MCP servers collection
│   ├── airtable-mcp-server/    # Airtable database integration
│   ├── asana-mcp-server/       # Asana project management
│   └── slack-mcp-server/       # Slack workspace integration
├── start.sh                   # Environment setup and startup script
└── README.md                  # Project documentation
```

Each MCP server is a standalone Node.js TypeScript project with its own dependencies and build process.

## Environment Setup

**Critical:** Always run `source ./start.sh` before starting Claude Code to ensure MCP servers are properly configured.

The setup process:
1. First run creates `.env.local` from `.env.example` template
2. Edit `.env.local` with actual API tokens (never commit this file)
3. Run `source ./start.sh` again to load environment variables
4. Start Claude Code with `claude`

Required environment variables:
- `AIRTABLE_TOKEN`: Personal access token for Airtable API
- `ASANA_ACCESS_TOKEN`: Personal access token for Asana API  
- `SLACK_BOT_TOKEN`: Bot User OAuth Token for Slack API
- Additional Slack OAuth variables for enhanced features

## Common Development Tasks

### Building MCP Servers
Each server has its own build process:

**Airtable MCP Server:**
```bash
cd servers/airtable-mcp-server
npm install
npm run build      # Standard TypeScript build
npm run test       # Run vitest tests
npm run lint       # ESLint validation
```

**Asana MCP Server:**
```bash
cd servers/asana-mcp-server
npm install
npm run build      # Custom esbuild process using build.js
npm run start      # Build and run server
npm run dev        # Development mode with ts-node/esm
npm run inspector  # Test with MCP Inspector (ports 5173/3000)
npm run clean      # Remove dist directory
```

**Slack MCP Server:**
```bash
cd servers/slack-mcp-server
npm install
npm run build      # TypeScript compilation
npm run start      # Standard execution
npm run start:oauth # OAuth-enabled version
```

### Working with Airtable MCP Server

**Key Base:** IS Project Portfolio Analytics (`app4Ny93YqbG8P5T5`)

**Important Tables:**
- `Tasks & Projects (Asana Sync)` (`tbllXxQcFRUcpmzbr`) - All tasks from Asana
- `Teams` (`tbl2M5h4QS9wF8KId`) - IS team information with record IDs
- `Boards (Asana Sync)` (`tblaFOALbimrnHCz1`) - Project/board data

**Team Record IDs for Filtering:**
- Digital Services: `reci4tTMnYLWNf2b7`
- Data Platform: `recreOnvEOfz4W0YS`
- Web Solutions: `recuHLDCQrKITD1fu`
- Product Development & Delivery: `rec2jT8eO71sTCGoJ`
- Technical Operations: `recmMhaCysor4wnI7`

**Efficient Query Patterns:**
```javascript
// Filter tasks by team and date range
filterByFormula: "AND(FIND('teamRecordId', ARRAYJOIN({IS Teams})), AND(IS_AFTER({Completed At}, '2025-05-31'), IS_BEFORE({Completed At}, '2025-07-01')))"
```

Always use `maxRecords` parameter to avoid overwhelming responses.

### Working with Asana MCP Server

**✅ Enhanced Capabilities (Updated August 2025):**
The Asana MCP server has been completely refactored with **direct Asana API alignment**, enabling comprehensive search capabilities.

**Native Dot Notation Support:**
- Use native Asana API parameters: `projects.any`, `assignee.not`, `due_on.after`, etc.
- 95%+ API coverage with zero transformation overhead
- Complex `opt_fields` including nested properties now fully supported

**Recommended Workflow:**
1. Start with `asana_list_workspaces`
2. Find projects using `asana_search_projects` with name patterns
3. Use comprehensive filtering with `asana_search_tasks`:
   ```json
   {
     "workspace": "workspace_gid",
     "projects.any": "project_gid",
     "completed": false,
     "is_subtask": false,
     "opt_fields": "name,gid,assignee,assignee.name,due_on,projects.name"
   }
   ```
4. Get detailed task information with `asana_get_task`

**Key Achievement:** Successfully retrieves exact task counts (e.g., 67 uncompleted parent tasks from IS Delivery project) using reliable parameter filtering.

## Architecture Details

### MCP Server Structure
Each server follows the MCP (Model Context Protocol) pattern:
- **Tools:** API operations (search, create, update tasks/projects)
- **Prompts:** Template-based interactions for common workflows
- **Resources:** Dynamic resource exposure (workspaces, projects as URIs)

### Asana MCP Server Architecture
```
src/
├── index.ts                 # Main server entry with MCP SDK setup
├── core/                    # Core functionality and infrastructure
│   ├── client.ts           # Asana API client wrapper  
│   ├── version.ts          # Version management
│   └── version.types.ts    # Version type definitions
├── handlers/               # MCP protocol request handlers
│   ├── tool-handler.ts     # Tool request routing and execution
│   ├── prompt-handler.ts   # Prompt template management
│   └── resource-handler.ts # Dynamic resource exposure
├── tools/                  # Individual tool implementations
│   ├── task-tools.ts       # Task operations (search, CRUD)
│   ├── project-tools.ts    # Project management tools
│   ├── workspace-tools.ts  # Workspace operations
│   └── ...                 # Additional tool categories
├── types/                  # TypeScript type definitions
│   └── asana.d.ts         # Asana API types
├── utils/                  # Shared utilities
│   └── validation.ts      # Input validation helpers
└── validators/            # Input validation functions
    └── html-validator.ts  # Asana HTML content validator
```

**Key Design Principles:**
- **Direct API Alignment:** Native Asana dot notation (`projects.any`) for zero transformation overhead
- **Type Safety:** Zod schemas for input validation across all operations
- **Read-Only Mode:** Optional safe mode that disables write operations
- **Comprehensive Coverage:** 22 tools supporting 95%+ of Asana API capabilities

### Build System
- **Asana:** Custom esbuild configuration in `build.js` for ES modules
- **Airtable:** Standard TypeScript compilation with Vitest testing
- **Slack:** TypeScript compilation with OAuth support variations

## Testing and Validation

- **Airtable Server:** Uses Vitest for unit tests (`npm run test`)
- **Asana Server:** MCP Inspector testing (`npm run inspector`)
- **Slack Server:** Basic functionality testing

Always verify MCP server functionality by checking they appear in `claude mcp list` after environment setup.

## Security Considerations

- All API tokens are stored in `.env.local` (gitignored)
- Never commit actual tokens to the repository
- Use `.env.example` as template for required variables
- The `start.sh` script masks variable values in output for security

## Adding New MCP Servers

1. Add as git submodule: `git submodule add <repo-url> servers/<server-name>`
2. Install dependencies and build in the new server directory
3. Add configuration to Claude Code's config file
4. Update this CLAUDE.md with server-specific guidance