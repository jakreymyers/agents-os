# Agents OS

A collection of MCP (Model Context Protocol) servers for powering AI agent teams.

## Structure

```
agents-os/
├── servers/           # MCP server submodules
│   └── airtable-mcp-server/  # Airtable integration server
├── .env.example       # Environment variable template
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## MCP Servers

### Airtable MCP Server

Located in `servers/airtable-mcp-server/` - provides read/write access to Airtable databases.

**Features:**
- List and search records
- Manage bases, tables, and fields
- CRUD operations on records
- Schema inspection

**Setup:**
1. Run: `source ./start.sh` (creates `.env.local` from template on first run)
2. Edit `.env.local` with your actual Airtable personal access token
3. Run: `source ./start.sh` to load environment variables
4. Start Claude Code: `claude`

## Adding New MCP Servers

1. Add new servers as git submodules in the `servers/` directory:
```bash
git submodule add <repository-url> servers/<server-name>
```

2. Install dependencies and build:
```bash
cd servers/<server-name>
npm install
npm run build
```

3. Add configuration to Claude Code's config file

## Environment Variables

All API keys and tokens are stored in `.env.local` (never committed to git):

- `AIRTABLE_API_KEY`: Personal access token for Airtable API

### Setup Process

1. **First run:** `source ./start.sh` (creates `.env.local` from template)
2. **Edit secrets:** Add your real API keys to `.env.local`
3. **Load environment:** `source ./start.sh` (loads environment variables)
4. **Start Claude Code:** `claude`

### File Types

- `.env.example` - Template (committed) showing required variables
- `.env.local` - Your secrets (never committed) 
- `start.sh` - Single script for setup and startup

## Security

- `.env.local` is gitignored to prevent token leakage
- Use `.env.example` as a template for required variables
- Never commit actual tokens to the repository
- The setup script masks variable values in output for security