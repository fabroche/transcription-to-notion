import { mcpClient } from '../libs/mcp-client.js';
import Boom from '@hapi/boom';

class AuthService {
  /**
   * Reconnect MCP client with existing credentials
   * Use this after manually running notebooklm-mcp-auth in terminal
   */
  async reconnect(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔄 Starting MCP reconnection...');

      // Step 1: Disconnect current MCP client
      console.log('🔌 Disconnecting MCP client...');
      await mcpClient.disconnect();

      // Step 2: Reconnect MCP client (will load credentials from ~/.notebooklm-mcp/auth.json)
      console.log('🔗 Reconnecting MCP client...');
      await mcpClient.connect();

      console.log('✅ MCP reconnection completed successfully');

      return {
        success: true,
        message: 'MCP client reconnected successfully. New credentials loaded from auth.json'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error reconnecting MCP client:', errorMessage);
      
      // Try to reconnect even if disconnect failed
      try {
        await mcpClient.connect();
        console.log('⚠️  Reconnected despite error');
      } catch (reconnectError) {
        // Log but don't throw - we already have the main error
        console.error('❌ Failed to reconnect MCP client:', reconnectError);
      }

      throw Boom.internal('Failed to reconnect MCP client', { error: errorMessage });
    }
  }
}

export const authService = new AuthService();
