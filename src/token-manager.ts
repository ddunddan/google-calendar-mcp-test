import * as fs from 'fs/promises';
import * as path from 'path';
import { OAuth2Client, Credentials } from 'google-auth-library';

export class TokenManager {
  private readonly tokenPath: string;

  constructor(private oauth2Client: OAuth2Client) {
    this.tokenPath = path.join(process.cwd(), '.gcp-saved-tokens.json');
  }

  public async loadSavedTokens(): Promise<Credentials | null> {
    try {
      const content = await fs.readFile(this.tokenPath, 'utf-8');
      const tokens = JSON.parse(content);

      // Check if tokens exist and access token is present
      if (!tokens || !tokens.access_token) {
        console.log('No valid tokens found in file');
        return null;
      }

      // Set credentials in OAuth client
      this.oauth2Client.setCredentials(tokens);

      // Check if tokens are expired or will expire soon
      const expiryDate = tokens.expiry_date;
      if (!expiryDate || expiryDate <= Date.now() + 5 * 60 * 1000) {
        console.log('Tokens are expired or will expire soon, refreshing...');
        
        // Attempt to refresh the token
        try {
          const { credentials } = await this.oauth2Client.refreshAccessToken();
          await this.saveTokens(credentials);
          return credentials;
        } catch (error) {
          console.error('Error refreshing token:', error);
          return null;
        }
      }

      return tokens;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        console.log('No saved tokens found');
        return null;
      }
      throw error;
    }
  }

  public async saveTokens(tokens: Credentials): Promise<void> {
    try {
      await fs.writeFile(this.tokenPath, JSON.stringify(tokens, null, 2));
      console.log('Tokens saved to:', this.tokenPath);
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  }
}