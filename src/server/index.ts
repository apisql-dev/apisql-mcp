import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

// 环境变量配置（演示默认值）
const API_URL = process.env.APISQL_MCP_API_URL || 'https://open.apisql.cn/api/mytest/$sudb';
const API_KEY = process.env.APISQL_MCP_API_KEY || 'Bearer sk-7dd9b66d38f8aff81f091ecfcf259f70';
const DEFAULT_DATA_SOURCE = process.env.APISQL_MCP_DS || 'mysql';

// 参数验证
const isValidExecuteSqlArgs = (args: any): args is { sc: string; ds?: string } =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.sc === 'string' &&
  (args.ds === undefined || typeof args.ds === 'string');

// 验证环境变量（可选，因为有默认值）
export const validateEnvironment = () => {
  if (!API_URL || API_URL === 'https://open.apisql.cn/api/mytest/$sudb') {
    console.error('⚠️  Using demo API URL. Set APISQL_MCP_API_URL for production use.');
  }
};

// 创建 MCP Server
export function createMcpServer() {
  validateEnvironment();

  const server = new Server(
    {
      name: 'apisql-mcp',
      version: '0.2.0',
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization': API_KEY,
    },
  });

  // 设置工具处理器
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'execute_sql',
        description: 'Execute a SQL query on the specified or default data source. ' +
          'Supports MySQL, PostgreSQL, SQL Server, Oracle, SQLite, StarRocks, Dameng, DuckDB, OceanBase, Trino, Presto, custom JDBC data sources and more. ' +
          'You can specify a different data source in the ds parameter or use the default from APISQL_MCP_DS env var.',
        inputSchema: {
          type: 'object',
          properties: {
            sc: {
              type: 'string',
              description: 'SQL query string to execute',
            },
            ds: {
              type: 'string',
              description: `Data source name (optional). Uses APISQL_MCP_DS env var (current: "${DEFAULT_DATA_SOURCE}") if not provided`,
            },
          },
          required: ['sc'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== 'execute_sql') {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${request.params.name}`
      );
    }

    if (!isValidExecuteSqlArgs(request.params.arguments)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Invalid arguments: sc (SQL query) is required and must be a string'
      );
    }

    const sc = request.params.arguments.sc;
    // 优先使用传入的 ds，否则使用环境变量默认值
    const dataSource = request.params.arguments.ds || DEFAULT_DATA_SOURCE;

    try {
      const response = await axiosInstance.post('', {
        meta: {
          ds: dataSource,
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          content: [
            {
              type: 'text',
              text: `API error: ${
                error.response?.data?.message ?? error.message
              }`,
            },
          ],
          isError: true,
        };
      }
      throw error;
    }
  });

  // 错误处理
  server.onerror = (error) => console.error('[MCP Error]', error);

  return server;
}
