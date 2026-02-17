#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const axios_1 = __importDefault(require("axios"));
const API_URL = process.env.APISQL_MCP_API_URL || 'https://open.apisql.cn/api/mytest/$sudb';
const API_KEY = process.env.APISQL_MCP_API_KEY || 'Bearer sk-7dd9b66d38f8aff81f091ecfcf259f70';
const DATA_SOURCE = process.env.APISQL_MCP_DS || 'mysql';
const isValidArgs = (args) => typeof args === 'object' &&
    args !== null &&
    typeof args.sc === 'string';
// Validate required environment variables
const validateEnvironment = () => {
    if (!API_URL) {
        throw new Error('APISQL_MCP_API_URL environment variable is required');
    }
    if (!API_KEY) {
        throw new Error('APISQL_MCP_API_KEY environment variable is required');
    }
    if (!DATA_SOURCE) {
        throw new Error('APISQL_MCP_DS environment variable is required');
    }
};
class SqlMcpServer {
    constructor() {
        this.server = new index_js_1.Server({
            name: 'apisql-mcp',
            version: '0.1.0',
        }, {
            capabilities: {
                resources: {},
                tools: {},
            },
        });
        // Validate environment variables
        validateEnvironment();
        this.axiosInstance = axios_1.default.create({
            baseURL: API_URL,
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': API_KEY,
            },
        });
        this.setupToolHandlers();
        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'execute_sql',
                    description: 'Execute a SQL query',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            sc: {
                                type: 'string',
                                description: 'SQL query string',
                            },
                        },
                        required: ['sc'],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            if (request.params.name !== 'execute_sql') {
                throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
            }
            if (!isValidArgs(request.params.arguments)) {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Invalid arguments');
            }
            const sc = request.params.arguments.sc;
            try {
                const response = await this.axiosInstance.post('', {
                    meta: {
                        ds: DATA_SOURCE,
                        sc: sc,
                    },
                    params: {},
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `API error: ${error.response?.data.message ?? error.message}`,
                            },
                        ],
                        isError: true,
                    };
                }
                throw error;
            }
        });
    }
    async run() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        console.error('SQL MCP server running on stdio');
    }
}
const server = new SqlMcpServer();
server.run().catch(console.error);
