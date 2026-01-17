import { notebookLLMService } from './notebookLLM.service.js';
import Boom from '@hapi/boom';

export interface TranscriptionResult {
  transcription: string;
  summary: string;
  notebookId?: string;
  driveFileId?: string;
}

class TranscriptionService {
  async processAudioFromDrive(driveFileId: string, prompt: string): Promise<TranscriptionResult> {
    let notebookId: string | undefined;

    try {
      console.log(`📁 Processing audio from Google Drive: ${driveFileId}`);

      // 1. Crear notebook temporal
      const notebookName = `Audio-Transcription-${Date.now()}`;
      const notebook = await notebookLLMService.createNotebook(notebookName);
      notebookId = notebook.content?.[0]?.text || notebook.id;

      if (!notebookId) {
        throw new Error('Failed to create notebook: No ID returned');
      }

      console.log(`📓 Created notebook: ${notebookName} (ID: ${notebookId})`);

      // 2. Agregar archivo de Drive al notebook
      // NotebookLLM automáticamente transcribirá el audio
      await notebookLLMService.addDriveFileToNotebook(notebookId, driveFileId);
      
      console.log(`⏳ Waiting for NotebookLLM to process the audio...`);
      console.log(`   This may take 15-30 seconds for audio files`);
      // Dar tiempo a NotebookLLM para procesar el archivo
      // Audio files need more time than text/PDFs
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds

      // 3. Obtener la transcripción completa
      console.log(`📝 Requesting transcription...`);
      const transcriptionQuery = await notebookLLMService.queryNotebook(
        notebookId,
        'Provide the complete, word-for-word transcription of the audio file. Do not summarize, just transcribe everything that was said.'
      );

      const transcription = transcriptionQuery.content?.[0]?.text || '';
      console.log(`   Transcription length: ${transcription.length} characters`);

      // 4. Hacer query con el prompt personalizado para el resumen
      console.log(`🔍 Generating summary with custom prompt...`);
      const summaryQuery = await notebookLLMService.queryNotebook(
        notebookId,
        prompt
      );

      const summary = summaryQuery.content?.[0]?.text || '';
      console.log(`   Summary length: ${summary.length} characters`);
      
      if (!transcription && !summary) {
        throw new Error('No response from NotebookLLM');
      }

      console.log(`✅ Successfully processed audio from Drive`);

      return {
        transcription,
        summary,
        notebookId,
        driveFileId
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error processing audio from Drive:', errorMessage);
      throw Boom.internal('Failed to process audio with NotebookLLM', { error: errorMessage });
    } finally {
      // Limpiar: eliminar notebook temporal (opcional, puedes comentar esto para debugging)
      if (notebookId) {
        try {
          await notebookLLMService.deleteNotebook(notebookId);
          console.log(`🗑️  Deleted temporary notebook ${notebookId}`);
        } catch (err) {
          console.error('Error deleting notebook:', err);
        }
      }
    }
  }
}

export const transcriptionService = new TranscriptionService();
