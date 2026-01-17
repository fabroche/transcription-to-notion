import { mcpClient } from '../libs/mcp-client.js';

interface NotebookResult {
  content?: Array<{ text: string }>;
  id?: string;
  [key: string]: any;
}

class NotebookLLMService {
  async createNotebook(name: string): Promise<NotebookResult> {
    try {
      const result = await mcpClient.callTool('notebook_create', {
        name
      });
      console.log(`📓 Created notebook: ${name}`);
      return result;
    } catch (error) {
      console.error('Error creating notebook:', error);
      throw error;
    }
  }

  async addTextToNotebook(notebookId: string, title: string, content: string): Promise<NotebookResult> {
    try {
      const result = await mcpClient.callTool('notebook_add_text', {
        notebook_id: notebookId,
        title,
        content
      });
      console.log(`📝 Added text to notebook ${notebookId}`);
      return result;
    } catch (error) {
      console.error('Error adding text to notebook:', error);
      throw error;
    }
  }

  async queryNotebook(notebookId: string, query: string): Promise<NotebookResult> {
    try {
      const result = await mcpClient.callTool('notebook_query', {
        notebook_id: notebookId,
        query
      });
      console.log(`🔍 Queried notebook ${notebookId}`);
      return result;
    } catch (error) {
      console.error('Error querying notebook:', error);
      throw error;
    }
  }

  async deleteNotebook(notebookId: string): Promise<void> {
    try {
      await mcpClient.callTool('notebook_delete', {
        notebook_id: notebookId
      });
      console.log(`🗑️  Deleted notebook ${notebookId}`);
    } catch (error) {
      console.error('Error deleting notebook:', error);
      // No lanzar error aquí, es limpieza
    }
  }
}

export const notebookLLMService = new NotebookLLMService();
