# Agents OS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Version](https://img.shields.io/badge/MCP-1.0+-blue.svg)](https://modelcontextprotocol.io)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)

A comprehensive collection of Model Context Protocol (MCP) servers designed to power AI agent teams with seamless integrations to popular productivity tools. This project enables AI assistants like Claude to interact with Airtable databases, manage Asana projects, and communicate through Slack workspaces.

## 🚀 Overview

Agents OS provides a unified framework for AI agents to interact with external services through the Model Context Protocol. Each MCP server in this collection offers specialized capabilities that can be combined to create powerful AI-driven workflows.

## 📁 Project Structure

```
agents-os/
├── servers/                    # MCP server collection
│   ├── airtable-mcp-server/    # Database operations & analytics
│   ├── asana-mcp-server/       # Project & task management
│   └── slack-mcp-server/       # Team communication & collaboration
├── .env.example               # Environment variable template
├── .env.local                 # Your API tokens (gitignored)
├── CLAUDE.md                  # Claude Code guidance document
├── start.sh                   # One-command environment setup
└── README.md                  # This file
```

## 🔧 Features

### Key Capabilities
- **Unified Interface**: Single setup script for all MCP servers
- **Security First**: Environment-based token management with masked output
- **AI-Optimized**: Built specifically for Claude Code and other AI assistants
- **Extensible**: Easy framework for adding new MCP server integrations
- **Production Ready**: Used in real-world AI agent workflows

## 📦 MCP Servers

### Airtable MCP Server

Located in `servers/airtable-mcp-server/` - provides read/write access to Airtable databases.

**Features:**
- List and search records
- Manage bases, tables, and fields
- CRUD operations on records
- Schema inspection

### Asana MCP Server

Located in `servers/asana-mcp-server/` - provides project management and task tracking capabilities.

**Features:**
- Create and manage projects
- Task creation and updates
- Team collaboration tools
- Project status tracking

### Slack MCP Server

Located in `servers/slack-mcp-server/` - enables AI integration with Slack workspaces.

**Features:**
- List channels and get channel history
- Post messages and reply to threads
- Add emoji reactions to messages
- Get user profiles and workspace information

## 🏃 Quick Start

```bash
# Clone the repository
git clone https://github.com/jakreymyers/agents-os.git
cd agents-os

# Run the setup script (creates .env.local on first run)
source ./start.sh

# Edit .env.local with your API tokens
# Then reload the environment
source ./start.sh

# Start Claude Code with MCP servers enabled
claude
```

## 🔑 Environment Variables

All API keys and tokens are stored in `.env.local` (never committed to git):

- `AIRTABLE_TOKEN`: Personal access token for Airtable API
- `ASANA_ACCESS_TOKEN`: Personal access token for Asana API  
- `SLACK_BOT_TOKEN`: Bot User OAuth Token for Slack API (starts with `xoxb-`) [Static auth]
- `SLACK_CLIENT_ID`: Slack app Client ID [OAuth 2.0 auth]
- `SLACK_CLIENT_SECRET`: Slack app Client Secret [OAuth 2.0 auth]
- `SLACK_REDIRECT_URI`: OAuth redirect URI [OAuth 2.0 auth]
- `SLACK_TEAM_ID`: Slack workspace Team ID (starts with `T`)
- `SLACK_CHANNEL_IDS`: Optional comma-separated list of channel IDs to limit access

## 🛡️ Security

- **Token Protection**: `.env.local` is gitignored to prevent accidental token exposure
- **Template System**: `.env.example` provides safe template for required variables
- **Masked Output**: Setup script automatically masks sensitive values in terminal output
- **Best Practices**: Never commit actual tokens; rotate tokens regularly

## 🔨 Development

### Adding New MCP Servers

1. Add new servers as git submodules:
```bash
git submodule add <repository-url> servers/<server-name>
```

2. Install dependencies and build:
```bash
cd servers/<server-name>
npm install
npm run build
```

3. Add required environment variables to `.env.example`
4. Update `CLAUDE.md` with server-specific guidance
5. Configure in Claude Code's settings

### Building Existing Servers

Each server has its own build process:

```bash
# Airtable MCP Server
cd servers/airtable-mcp-server
npm run build      # TypeScript compilation
npm run test       # Run tests with Vitest
npm run lint       # ESLint validation

# Asana MCP Server  
cd servers/asana-mcp-server
npm run build      # Custom esbuild process
npm run dev        # Development mode

# Slack MCP Server
cd servers/slack-mcp-server
npm run build      # TypeScript compilation
npm run start:oauth # OAuth-enabled version
```

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)**: Detailed guidance for Claude Code when working with this repository
- **[servers/INSTRUCTIONS.md](./servers/INSTRUCTIONS.md)**: MCP server usage patterns and best practices
- **Individual Server READMEs**: Each server has its own documentation in its directory

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the individual server directories for specific license information.

## 🙏 Acknowledgments

- Built on the [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic
- Airtable MCP Server by [domdomegg](https://github.com/domdomegg)
- Asana MCP Server enhanced for agents-os
- Slack MCP Server developed for agents-os

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/jakreymyers/agents-os/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jakreymyers/agents-os/discussions)

---

*Agents OS - Empowering AI teams with seamless tool integrations* 🤖✨