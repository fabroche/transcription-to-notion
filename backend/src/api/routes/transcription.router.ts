import express, { Request, Response, NextFunction } from 'express';
import { validatorHandler } from '../middlewares/validator.middleware.js';
import { transcriptionSchema } from '../schemas/transcription.schema.js';
import { transcriptionService } from '../services/transcription.service.js';
import Boom from '@hapi/boom';
import { log } from 'node:console';

export const router = express.Router();

router.post(
  '/transcribe',
  // Debug middleware
  (req: Request, _res: Response, next: NextFunction) => {
    console.log('🔍 DEBUG - Headers:', req.headers);
    console.log('🔍 DEBUG - Body:', req.body);
    console.log('🔍 DEBUG - Body type:', typeof req.body);
    next();
  },
  validatorHandler(transcriptionSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { driveFileId, prompt } = req.body;

      console.log(`📥 Received transcription request`);
      console.log(`   Drive File ID: ${driveFileId}`);
      console.log(`   Prompt: ${prompt?.substring(0, 50)}...`);

      const result = await transcriptionService.processAudioFromDrive(driveFileId, prompt);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// Health check endpoint
router.get('/health', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Transcription service is running',
    timestamp: new Date().toISOString()
  });
});
