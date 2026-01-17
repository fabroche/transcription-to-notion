import express, { Express } from 'express';
import { router as transcriptionRouter } from './transcription.router.js';
import { router as notebookQueryRouter } from './notebookQuery.router.js';

export function routerApi(app: Express): void {
  const router = express.Router();
  app.use('/api/v1', router);
  
  router.use('/transcription', transcriptionRouter);
  router.use('/notebook', notebookQueryRouter);
}
