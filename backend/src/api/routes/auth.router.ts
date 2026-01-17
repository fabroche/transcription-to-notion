import express, { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';

export const router = express.Router();

/**
 * POST /api/v1/auth/reconnect
 * Reconnect MCP client with existing credentials
 * 
 * Usage:
 * 1. Run `notebooklm-mcp-auth` in terminal to refresh credentials
 * 2. Call this endpoint to reconnect MCP client
 */
router.post(
  '/reconnect',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('📥 Received MCP reconnect request');

      const result = await authService.reconnect();

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/auth/health
 * Health check for auth service
 */
router.get('/health', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});
