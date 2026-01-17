import express, { Request, Response, NextFunction } from 'express';
import { upload } from '../middlewares/upload.middleware.js';
import { validatorHandler } from '../middlewares/validator.middleware.js';
import { transcriptionSchema } from '../schemas/transcription.schema.js';
import { transcriptionService } from '../services/transcription.service.js';
import Boom from '@hapi/boom';

export const router = express.Router();

router.post(
  '/transcribe',
  upload.single('audio'),
  validatorHandler(transcriptionSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw Boom.badRequest('Audio file is required');
      }

      const { prompt } = req.body;
      const audioPath = req.file.path;

      console.log(`📥 Received transcription request`);
      console.log(`   File: ${req.file.originalname}`);
      console.log(`   Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Prompt: ${prompt.substring(0, 50)}...`);

      const result = await transcriptionService.processAudio(audioPath, prompt);

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
