"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStdioTransport = runStdioTransport;
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
async function runStdioTransport(server) {
    const transport = new stdio_js_1.StdioServerTransport();
    // 处理 SIGINT 信号
    process.on('SIGINT', async () => {
        await server.close();
        process.exit(0);
    });
    await server.connect(transport);
    console.error('SQL MCP server running on stdio');
}
