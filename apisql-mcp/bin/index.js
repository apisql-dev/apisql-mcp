#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const index_js_1 = require("./server/index.js");
const stdio_js_1 = require("./transports/stdio.js");
const streamableHttp_js_1 = require("./transports/streamableHttp.js");
const program = new commander_1.Command();
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
    const server = (0, index_js_1.createMcpServer)();
    // 根据传输类型启动
    switch (options.transport) {
        case 'stdio':
            await (0, stdio_js_1.runStdioTransport)(server);
            break;
        case 'streamable-http':
        case 'http':
            const port = parseInt(options.port, 10);
            const host = options.host;
            await (0, streamableHttp_js_1.runStreamableHttpTransport)(server, port, host);
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
