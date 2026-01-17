import { notebookLLMService } from './notebookLLM.service.js';
import fs from 'node:fs/promises';
import Boom from '@hapi/boom';

export interface TranscriptionResult {
  transcription: string;
  summary: string;
  notebookId?: string;
}

class TranscriptionService {
  async processAudio(audioPath: string, prompt: string): Promise<TranscriptionResult> {
    let notebookId: string | undefined;

    try {
      console.log(`🎵 Processing audio: ${audioPath}`);

      // 1. Crear notebook temporal
      const notebookName = `Transcription-${Date.now()}`;
      const notebook = await notebookLLMService.createNotebook(notebookName);
      notebookId = notebook.content?.[0]?.text || notebook.id;

      if (!notebookId) {
        throw new Error('Failed to create notebook: No ID returned');
      }

      // 2. Leer el archivo de audio y agregarlo como texto
      // Nota: NotebookLLM puede no soportar audio directamente vía MCP
      // Esta es una implementación inicial que puede necesitar ajustes
      const audioContent = await fs.readFile(audioPath, 'base64');
      await notebookLLMService.addTextToNotebook(
        notebookId,
        'Audio File',
        `Audio file (base64): ${audioContent.substring(0, 100)}...`
      );

      // 3. Hacer query con el prompt personalizado
      const queryResult = await notebookLLMService.queryNotebook(
        notebookId,
        `Transcribe and analyze this audio with the following instruction: ${prompt}`
      );

      // 4. Extraer transcripción y resumen
      const responseText = queryResult.content?.[0]?.text || '';
      
      if (!responseText) {
        throw new Error('No response from NotebookLLM');
      }

      return {
        transcription: responseText,
        summary: responseText,
        notebookId // Para debugging
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error processing audio:', errorMessage);
      throw Boom.internal('Failed to process audio with NotebookLLM', { error: errorMessage });
    } finally {
      // 5. Limpiar: eliminar archivo temporal
      try {
        await fs.unlink(audioPath);
        console.log(`🗑️  Deleted temp file: ${audioPath}`);
      } catch (err) {
        console.error('Error deleting temp file:', err);
      }

      // 6. Limpiar: eliminar notebook temporal
      if (notebookId) {
        try {
          await notebookLLMService.deleteNotebook(notebookId);
        } catch (err) {
          console.error('Error deleting notebook:', err);
        }
      }
    }
  }
}

export const transcriptionService = new TranscriptionService();
