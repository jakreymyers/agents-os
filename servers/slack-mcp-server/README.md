# Slack MCP Server

A Model Context Protocol server for the Slack API, enabling AI assistants to interact with Slack workspaces.

## Features

This MCP server provides comprehensive Slack integration with the following tools:

1. **slack_list_channels** - List public or pre-defined channels in the workspace
2. **slack_post_message** - Post a new message to a Slack channel  
3. **slack_reply_to_thread** - Reply to a specific message thread
4. **slack_add_reaction** - Add an emoji reaction to a message
5. **slack_get_channel_history** - Get recent messages from a channel
6. **slack_get_thread_replies** - Get all replies in a message thread
7. **slack_get_users** - Get list of workspace users with basic profile information
8. **slack_get_user_profile** - Get detailed profile information for a specific user

## Setup

### 1. Create a Slack App

1. Visit the [Slack Apps page](https://api.slack.com/apps)
2. Click "Create New App"
3. Choose "From scratch"
4. Name your app and select your workspace

### 2. Configure Bot Token Scopes

Navigate to "OAuth & Permissions" and add these scopes:

- `channels:history` - View messages and other content in public channels
- `channels:read` - View basic channel information  
- `chat:write` - Send messages as the app
- `reactions:write` - Add emoji reactions to messages
- `users:read` - View users and their basic information
- `users.profile:read` - View detailed profiles about users

### 3. Install App to Workspace

1. Click "Install to Workspace" and authorize the app
2. Save the "Bot User OAuth Token" that starts with `xoxb-`

### 4. Get your Team ID

Your Team ID starts with `T` and can be found in your Slack workspace URL or through the API.

## Installation

### NPX (Recommended)

```bash
npx slack-mcp-server
```

### From Source

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Run the server:
   ```bash
   npm start
   ```

## Configuration

### Authentication Methods

The server supports two authentication methods:

#### Method 1: Static Bot Token (Simple)
- `SLACK_BOT_TOKEN` (required) - Your Bot User OAuth Token starting with `xoxb-`
- `SLACK_TEAM_ID` (required) - Your Slack workspace ID starting with `T`
- `SLACK_CHANNEL_IDS` (optional) - Comma-separated list of channel IDs to limit access

#### Method 2: Dynamic OAuth 2.0 Flow (Advanced)
- `SLACK_CLIENT_ID` (required) - Your Slack app's Client ID
- `SLACK_CLIENT_SECRET` (required) - Your Slack app's Client Secret
- `SLACK_REDIRECT_URI` (required) - OAuth redirect URI
- `SLACK_TEAM_ID` (required) - Your Slack workspace ID starting with `T`
- `SLACK_CHANNEL_IDS` (optional) - Comma-separated list of channel IDs to limit access

### OAuth 2.0 Setup

For dynamic OAuth flows:

1. **Configure OAuth in Slack App:**
   - Go to your Slack app settings
   - Navigate to "OAuth & Permissions"
   - Add your redirect URI (e.g., `http://localhost:3000/oauth/slack/callback`)
   - Note your Client ID and Client Secret

2. **Set OAuth Environment Variables:**
   ```bash
   SLACK_CLIENT_ID=your_client_id
   SLACK_CLIENT_SECRET=your_client_secret
   SLACK_REDIRECT_URI=http://localhost:3000/oauth/slack/callback
   SLACK_TEAM_ID=T01234567
   ```

3. **Use OAuth Tools:**
   - `slack_get_oauth_url` - Generate authorization URL
   - `slack_exchange_oauth_code` - Exchange code for token
   - `slack_oauth_status` - Check configuration status

### Claude Desktop Configuration

#### Static Token Configuration
Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "slack": {
      "command": "node",
      "args": ["/path/to/slack-mcp-server/dist/index.js"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-bot-token",
        "SLACK_TEAM_ID": "T01234567",
        "SLACK_CHANNEL_IDS": "C01234567,C76543210"
      }
    }
  }
}
```

#### OAuth Configuration
```json
{
  "mcpServers": {
    "slack-oauth": {
      "command": "node",
      "args": ["/path/to/slack-mcp-server/dist/enhanced-index.js"],
      "env": {
        "SLACK_CLIENT_ID": "your_client_id",
        "SLACK_CLIENT_SECRET": "your_client_secret", 
        "SLACK_REDIRECT_URI": "http://localhost:3000/oauth/slack/callback",
        "SLACK_TEAM_ID": "T01234567",
        "SLACK_CHANNEL_IDS": "C01234567,C76543210"
      }
    }
  }
}
```

#### Hybrid Configuration (Both Methods)
```json
{
  "mcpServers": {
    "slack-oauth": {
      "command": "node",
      "args": ["/path/to/slack-mcp-server/dist/enhanced-index.js"],
      "env": {
        "SLACK_CLIENT_ID": "your_client_id",
        "SLACK_CLIENT_SECRET": "your_client_secret",
        "SLACK_REDIRECT_URI": "http://localhost:3000/oauth/slack/callback",
        "SLACK_BOT_TOKEN": "xoxb-fallback-token",
        "SLACK_TEAM_ID": "T01234567"
      }
    }
  }
}
```

### Docker

Build and run with Docker:

```bash
docker build -t slack-mcp-server .
docker run -e SLACK_BOT_TOKEN=xoxb-your-token -e SLACK_TEAM_ID=T01234567 slack-mcp-server
```

## Usage Examples

### List Channels
```json
{
  "tool": "slack_list_channels",
  "arguments": {
    "limit": 50
  }
}
```

### Post Message
```json
{
  "tool": "slack_post_message", 
  "arguments": {
    "channel_id": "C01234567",
    "text": "Hello from MCP!"
  }
}
```

### Get Channel History
```json
{
  "tool": "slack_get_channel_history",
  "arguments": {
    "channel_id": "C01234567",
    "limit": 20
  }
}
```

### Add Reaction
```json
{
  "tool": "slack_add_reaction",
  "arguments": {
    "channel_id": "C01234567", 
    "timestamp": "1234567890.123456",
    "reaction": "thumbsup"
  }
}
```

## OAuth Usage Examples

### Check OAuth Status
```json
{
  "tool": "slack_oauth_status",
  "arguments": {}
}
```

### Get OAuth Authorization URL
```json
{
  "tool": "slack_get_oauth_url",
  "arguments": {
    "state": "optional_security_state"
  }
}
```

### Exchange Authorization Code for Token
```json
{
  "tool": "slack_exchange_oauth_code",
  "arguments": {
    "code": "authorization_code_from_callback"
  }
}
```

## OAuth Flow Process

1. **Start OAuth Flow:**
   ```
   Use slack_get_oauth_url tool → Get authorization URL
   ```

2. **User Authorization:**
   ```
   User visits URL → Authorizes app → Redirected with code
   ```

3. **Exchange Code:**
   ```
   Use slack_exchange_oauth_code → Get access token
   ```

4. **Use Slack Tools:**
   ```
   All regular Slack tools now work with the new token
   ```

## Troubleshooting

### Permission Errors

If you encounter permission errors, verify that:

1. All required scopes are added to your Slack app
2. The app is properly installed to your workspace
3. The tokens and workspace ID are correctly copied to your configuration
4. The app has been added to the channels it needs to access

### Channel Access Issues

- Ensure the Slack bot has been invited to the channels it needs to access
- Use the `SLACK_CHANNEL_IDS` environment variable to limit access to specific channels
- Check that channel IDs are correct (they start with `C`)

## Development

### Scripts

- `npm run build` - Build the TypeScript project
- `npm run dev` - Build in watch mode
- `npm start` - Start the server
- `npm run clean` - Clean build artifacts

### Project Structure

```
src/
├── index.ts          # Main server implementation
├── types.ts          # Type definitions (if needed)
└── utils.ts          # Utility functions (if needed)
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.