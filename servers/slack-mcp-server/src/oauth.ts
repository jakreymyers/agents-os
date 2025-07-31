import { z } from "zod";

// OAuth configuration schema
export const oauthConfigSchema = z.object({
  SLACK_CLIENT_ID: z.string().optional(),
  SLACK_CLIENT_SECRET: z.string().optional(),
  SLACK_REDIRECT_URI: z.string().optional(),
  SLACK_BOT_TOKEN: z.string().optional(),
  SLACK_TEAM_ID: z.string(),
  SLACK_CHANNEL_IDS: z.string().optional(),
});

export type OAuthConfig = z.infer<typeof oauthConfigSchema>;

export interface SlackOAuthResponse {
  ok: boolean;
  access_token?: string;
  bot_user_id?: string;
  scope?: string;
  token_type?: string;
  team?: {
    id: string;
    name: string;
  };
  enterprise?: {
    id: string;
    name: string;
  };
  authed_user?: {
    id: string;
    scope?: string;
    access_token?: string;
    token_type?: string;
  };
  error?: string;
}

export class SlackOAuthManager {
  private config: OAuthConfig;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    if (!this.config.SLACK_CLIENT_ID || !this.config.SLACK_REDIRECT_URI) {
      throw new Error("OAuth configuration incomplete. Need SLACK_CLIENT_ID and SLACK_REDIRECT_URI");
    }

    const params = new URLSearchParams({
      client_id: this.config.SLACK_CLIENT_ID,
      scope: [
        'channels:history',
        'channels:read', 
        'chat:write',
        'reactions:write',
        'users:read',
        'users.profile:read',
        'bot'
      ].join(','),
      redirect_uri: this.config.SLACK_REDIRECT_URI,
      response_type: 'code',
      ...(state && { state })
    });

    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<SlackOAuthResponse> {
    if (!this.config.SLACK_CLIENT_ID || !this.config.SLACK_CLIENT_SECRET || !this.config.SLACK_REDIRECT_URI) {
      throw new Error("OAuth configuration incomplete");
    }

    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.SLACK_CLIENT_ID,
        client_secret: this.config.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: this.config.SLACK_REDIRECT_URI,
      }),
    });

    const data = await response.json() as SlackOAuthResponse;
    
    if (!data.ok) {
      throw new Error(`OAuth error: ${data.error}`);
    }

    return data;
  }

  /**
   * Refresh access token (if using user tokens)
   */
  async refreshToken(refreshToken: string): Promise<SlackOAuthResponse> {
    if (!this.config.SLACK_CLIENT_ID || !this.config.SLACK_CLIENT_SECRET) {
      throw new Error("OAuth configuration incomplete");
    }

    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.SLACK_CLIENT_ID,
        client_secret: this.config.SLACK_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json() as SlackOAuthResponse;
    
    if (!data.ok) {
      throw new Error(`Token refresh error: ${data.error}`);
    }

    return data;
  }

  /**
   * Check if OAuth is configured
   */
  isOAuthConfigured(): boolean {
    return !!(this.config.SLACK_CLIENT_ID && this.config.SLACK_CLIENT_SECRET && this.config.SLACK_REDIRECT_URI);
  }

  /**
   * Check if static token is configured
   */
  isStaticTokenConfigured(): boolean {
    return !!this.config.SLACK_BOT_TOKEN;
  }
}