import { notebookLLMService } from './notebookLLM.service.js';
import Boom from '@hapi/boom';

export interface NotebookQueryResult {
  answer: string;
  notebookId: string;
  notebookTitle: string;
}

class NotebookQueryService {
  async queryNotebookByName(notebookTitle: string, prompt: string): Promise<NotebookQueryResult> {
    try {
      console.log(`🔍 Searching for notebook: "${notebookTitle}"`);

      // 1. Listar todos los notebooks
      const notebooks = await notebookLLMService.listNotebooks();
      
      // 2. Buscar el notebook por título (case-insensitive)
      const notebook = notebooks.find((nb: any) => 
        nb.title?.toLowerCase() === notebookTitle.toLowerCase()
      );

      if (!notebook) {
        throw Boom.notFound(`Notebook "${notebookTitle}" not found. Available notebooks: ${notebooks.map((nb: any) => nb.title).join(', ')}`);
      }

      const notebookId = notebook.id;
      console.log(`📓 Found notebook: ${notebook.title} (ID: ${notebookId})`);

      // 3. Hacer la consulta al notebook
      console.log(`💬 Querying notebook with prompt: "${prompt.substring(0, 50)}..."`);
      const queryResult = await notebookLLMService.queryNotebook(notebookId, prompt);

      const answer = queryResult.content?.[0]?.text || queryResult.answer || '';
      
      if (!answer) {
        throw Boom.internal('NotebookLLM returned an empty response. The notebook may not have any sources or the query may need to be more specific.');
      }

      console.log(`✅ Query successful. Answer length: ${answer.length} characters`);

      return {
        answer,
        notebookId,
        notebookTitle: notebook.title || notebookTitle
      };

    } catch (error) {
      if (Boom.isBoom(error)) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error querying notebook:', errorMessage);
      throw Boom.internal('Failed to query NotebookLLM', { error: errorMessage });
    }
  }
}

export const notebookQueryService = new NotebookQueryService();
