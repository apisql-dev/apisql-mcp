#!/usr/bin/env node
import { Command } from 'commander';
import { createMcpServer } from './server/index.js';
import { runStdioTransport } from './transports/stdio.js';
import { runStreamableHttpTransport } from './transports/streamableHttp.js';

const program = new Command();

program
  .name('apisql-mcp')
  .description('MCP server for executing SQL queries via API SQL service')
  .version('0.2.0')
  .option('-t, --transport <type>', 'Transport type (stdio, streamable-http)', 'stdio')
  .option('-p, --port <number>', 'HTTP server port (only for streamable-http)', '9090')
  .option('-h, --host <host>', 'HTTP server host (only for streamable-http)', '127.0.0.1')
  .parse();

const options = program.opts();

async function main() {
  // 创建 MCP Server
  const server = createMcpServer();

  // 根据传输类型启动
  switch (options.transport) {
    case 'stdio':
      await runStdioTransport(server);
      break;
    
    case 'streamable-http':
    case 'http':
      const port = parseInt(options.port, 10);
      const host = options.host;
      await runStreamableHttpTransport(server, port, host);
      break;
    
    default:
      console.error(`Unknown transport: ${options.transport}`);
      console.error('Supported transports: stdio, streamable-http');
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
