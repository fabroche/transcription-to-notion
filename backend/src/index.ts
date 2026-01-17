import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { routerApi } from './api/routes/index.js';
import { errorHandler } from './api/middlewares/error.middleware.js';
import { mcpClient } from './api/libs/mcp-client.js';

const app = express();

// Middlewares
app.use(cors({
  origin: config.corsOrigin
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
routerApi(app);

// Root endpoint
app.get('/', (_req: Request, res: Response): void => {
  res.json({
    message: 'NotebookLM Query API',
    version: '1.0.0',
    endpoints: {
      notebookList: 'GET /api/v1/notebook/list',
      notebookQuery: 'POST /api/v1/notebook/query',
      notebookHealth: 'GET /api/v1/notebook/health'
    }
  });
});

// Error handler (debe ir al final)
app.use(errorHandler);

// Server
const server = app.listen(config.port, async (): Promise<void> => {
  console.log('');
  console.log('🚀 ========================================');
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`🚀 Environment: ${config.env}`);
  console.log(`🚀 CORS Origin: ${config.corsOrigin}`);
  console.log('🚀 ========================================');
  console.log('');
  
  // Conectar al MCP al iniciar
  try {
    await mcpClient.connect();
  } catch (error) {
    console.error('⚠️  Warning: Failed to connect to MCP on startup');
    console.error('   Make sure you have installed and authenticated NotebookLLM MCP:');
    console.error('   1. uv tool install notebooklm-mcp-server');
    console.error('   2. notebooklm-mcp-auth');
    console.error('   Error details:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', async (): Promise<void> => {
  console.log('SIGTERM received, closing server...');
  await mcpClient.disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async (): Promise<void> => {
  console.log('\nSIGINT received, closing server...');
  await mcpClient.disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
