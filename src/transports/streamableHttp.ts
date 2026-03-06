import http from 'http';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { randomUUID } from 'crypto';

export async function runStreamableHttpTransport(
  server: Server,
  port: number,
  host: string
) {
  // 创建无状态的 Streamable HTTP 传输（不启用会话管理）
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // 无状态模式
  });

  // 创建 HTTP 服务器
  const httpServer = http.createServer(async (req, res) => {
    // 设置 CORS 头（允许所有来源，因为 apiSQL 平台已处理 CORS）
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // 只处理 /mcp 路径的请求
    if (req.url !== '/mcp') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
      return;
    }

    // 添加认证信息到请求对象
    const authHeader = req.headers.authorization;
    if (authHeader) {
      (req as any).auth = { token: authHeader };
    }

    try {
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error('[HTTP Transport Error]', error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    }
  });

  // 连接 MCP server 到 transport
  await server.connect(transport);

  // 启动 HTTP 服务器
  return new Promise<void>((resolve, reject) => {
    httpServer.listen(port, host, () => {
      console.error(`SQL MCP server running on http://${host}:${port}/mcp`);
      console.error(`Transport: streamable-http`);
      console.error(`Press Ctrl+C to stop`);
      resolve();
    });

    httpServer.on('error', (error) => {
      console.error('[HTTP Server Error]', error);
      reject(error);
    });

    // 处理关闭信号
    const shutdown = async () => {
      console.error('\nShutting down server...');
      httpServer.close(async () => {
        await server.close();
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  });
}
