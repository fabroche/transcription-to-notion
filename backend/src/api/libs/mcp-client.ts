import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

interface MCPToolResult {
  content?: Array<{ text: string }>;
  [key: string]: any;
}

class MCPClient {
  private client: Client | null = null;
  private isConnected: boolean = false;

  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('✅ MCP already connected');
      return;
    }

    try {
      const transport = new StdioClientTransport({
        command: 'notebooklm-mcp-server',
        args: []
      });

      this.client = new Client({
        name: 'transcription-backend',
        version: '1.0.0'
      }, {
        capabilities: {}
      });

      await this.client.connect(transport);
      this.isConnected = true;
      console.log('✅ Connected to NotebookLLM MCP');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to connect to MCP:', errorMessage);
      throw error;
    }
  }

  async callTool(toolName: string, args: Record<string, any>): Promise<MCPToolResult> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const result = await this.client!.callTool({
        name: toolName,
        arguments: args
      });
      return result as MCPToolResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Error calling tool ${toolName}:`, errorMessage);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log('🔌 Disconnected from MCP');
    }
  }
}

export const mcpClient = new MCPClient();
