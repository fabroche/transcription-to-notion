import express, { Express } from 'express';
import { router as notebookQueryRouter } from './notebookQuery.router.js';
import { router as authRouter } from './auth.router.js';

export function routerApi(app: Express): void {
  const router = express.Router();
  app.use('/api/v1', router);
  
  router.use('/notebook', notebookQueryRouter);
  router.use('/auth', authRouter);
}
