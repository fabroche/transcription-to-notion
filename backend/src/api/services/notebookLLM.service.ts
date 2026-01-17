import { mcpClient } from '../libs/mcp-client.js';

interface NotebookResult {
  content?: Array<{ text: string }>;
  id?: string;
  [key: string]: any;
}

class NotebookLLMService {
  async listNotebooks(): Promise<NotebookResult[]> {
    try {
      const result = await mcpClient.callTool('notebook_list', {});
      console.log(`📚 Listed notebooks`, result);
      console.log(`🔍 DEBUG - Result keys:`, Object.keys(result));
      console.log(`🔍 DEBUG - Has content:`, 'content' in result);
      
      // MCP tools return results in a 'content' array
      if (result.content && Array.isArray(result.content) && result.content[0]) {
        const firstContent = result.content[0];
        console.log(`🔍 DEBUG - First content type:`, typeof firstContent.text);
        
        let notebooks;
        if (typeof firstContent.text === 'string') {
          // If it's a JSON string, parse it
          notebooks = JSON.parse(firstContent.text);
        } else {
          // If it's already an object/array, use it directly
          notebooks = firstContent.text || firstContent;
        }
        
        console.log(`🔍 DEBUG - Notebooks type:`, typeof notebooks);
        console.log(`🔍 DEBUG - Is array:`, Array.isArray(notebooks));
        console.log(`🔍 DEBUG - Notebooks count:`, Array.isArray(notebooks) ? notebooks.length : 'not an array');
        
        return Array.isArray(notebooks) ? notebooks : (notebooks.notebooks || []);
      }
      
      return [];
    } catch (error) {
      console.error('Error listing notebooks:', error);
      throw error;
    }
  }

  async createNotebook(name: string): Promise<NotebookResult> {
    try {
      const result = await mcpClient.callTool('notebook_create', {
        title: name
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

  async addDriveFileToNotebook(
    notebookId: string, 
    driveFileId: string, 
    title: string = 'Audio File'
  ): Promise<NotebookResult> {
    try {
      const result = await mcpClient.callTool('notebook_add_drive', {
        notebook_id: notebookId,
        id: driveFileId,
        title: title
      });
      console.log(`📁 Added Drive file to notebook ${notebookId}`);
      return result;
    } catch (error) {
      console.error('Error adding Drive file to notebook:', error);
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
