import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

export async function runStdioTransport(server: Server) {
  const transport = new StdioServerTransport();
  
  // 处理 SIGINT 信号
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  await server.connect(transport);
  console.error('SQL MCP server running on stdio');
}
