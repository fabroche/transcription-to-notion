import dotenv from 'dotenv';

dotenv.config();

interface MCPConfig {
  authTokenPath: string;
}

interface Config {
  env: string;
  port: number;
  corsOrigin: string;
  mcp: MCPConfig;
}

export const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: Number.parseInt(process.env.PORT || '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  mcp: {
    authTokenPath: process.env.MCP_AUTH_PATH || '~/.notebooklm-mcp/auth.json'
  }
};
