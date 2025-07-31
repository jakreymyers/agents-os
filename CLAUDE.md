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
npm run build      # Custom esbuild process
npm run start      # Build and run
npm run dev        # Development mode with ts-node
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

**Critical Limitations:**
- The `asana_search_tasks` function with `projects_any` parameter frequently fails with "Bad Request" errors
- Complex `opt_fields` with nested properties (e.g., `assignee.name`) cause failures

**Recommended Workflow:**
1. Start with `asana_list_workspaces`
2. Find projects using `asana_search_projects` with name patterns
3. Get project structure with `asana_get_project` and `asana_get_project_sections`
4. **Use text-based search instead of project filters:**
   ```javascript
   // ✅ WORKS
   asana_search_tasks({ workspace: "gid", text: "keyword" })
   
   // ❌ FAILS  
   asana_search_tasks({ workspace: "gid", projects_any: "project_gid" })
   ```
5. Get specific task details with `asana_get_task`

**Safe opt_fields:** `name`, `notes`, `due_on`, `assignee`, `completed`, `created_at`, `projects`

## Testing and Validation

- **Airtable Server:** Uses Vitest for unit tests (`npm run test`)
- **Asana Server:** No tests currently implemented
- **Slack Server:** No tests currently implemented

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