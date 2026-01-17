import express, { Request, Response, NextFunction } from 'express';
import { validatorHandler } from '../middlewares/validator.middleware.js';
import { notebookQuerySchema } from '../schemas/notebookQuery.schema.js';
import { notebookQueryService } from '../services/notebookQuery.service.js';

export const router = express.Router();

router.post(
  '/query',
  validatorHandler(notebookQuerySchema, 'body'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { notebookTitle, prompt } = req.body;

      console.log(`📥 Received notebook query request`);
      console.log(`   Notebook: "${notebookTitle}"`);
      console.log(`   Prompt: "${prompt.substring(0, 50)}..."`);

      const result = await notebookQueryService.queryNotebookByName(notebookTitle, prompt);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// List all notebooks
router.get('/list', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { notebookLLMService } = await import('../services/notebookLLM.service.js');
    const notebooks = await notebookLLMService.listNotebooks();
    
    res.json({
      success: true,
      data: {
        notebooks: notebooks.map((nb: any) => ({
          id: nb.id,
          title: nb.title,
          url: nb.url
        })),
        count: notebooks.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Health check endpoint
router.get('/health', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Notebook query service is running',
    timestamp: new Date().toISOString()
  });
});
