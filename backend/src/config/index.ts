import dotenv from 'dotenv';

dotenv.config();

interface UploadConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  uploadDir: string;
}

interface MCPConfig {
  authTokenPath: string;
}

interface Config {
  env: string;
  port: number;
  corsOrigin: string;
  upload: UploadConfig;
  mcp: MCPConfig;
}

export const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: Number.parseInt(process.env.PORT || '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  upload: {
    maxFileSize: Number.parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB
    allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/webm', 'audio/x-m4a'],
    uploadDir: './uploads'
  },
  mcp: {
    authTokenPath: process.env.MCP_AUTH_PATH || '~/.notebooklm-mcp/auth.json'
  }
};
