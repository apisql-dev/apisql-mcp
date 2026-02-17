# apisql-mcp

[![npm version](https://img.shields.io/npm/v/apisql-mcp.svg)](https://www.npmjs.com/package/apisql-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

English | [简体中文](./README.zh-CN.md)

> **The Swiss Army Knife of Database MCP Servers**

A universal database MCP (Model Context Protocol) server that enables AI assistants to execute SQL queries across multiple databases through [apiSQL](https://www.apisql.cn). Connect to MySQL, PostgreSQL, SQL Server, Oracle, and more — all with a single MCP server.

## ✨ Features

- **One MCP, Multiple Databases** — Query MySQL, PostgreSQL, SQL Server, Oracle, SQLite, StarRocks, Dameng, DuckDB, OceanBase, Trino, Presto, and any JDBC-compatible database
- **Dynamic Data Source Switching** — Switch between databases on-the-fly without restarting the MCP server
- **No Port Forwarding Required** — Access internal databases from cloud-based MCP clients via apiSQL's secure gateway
- **Full SQL Support** — Complete support for DDL (CREATE, ALTER, DROP) and DML (SELECT, INSERT, UPDATE, DELETE) operations
- **Observability** — Built-in logging and monitoring via apiSQL platform
- **Multiple Transport Modes** — Support for both STDIO (default) and Streamable HTTP transports

## ⚠️ Security Best Practices

**apiSQL-mcp provides full database access including schema modifications and data manipulation. Please follow these security guidelines:**

1. **Principle of Least Privilege**: 
   - Create dedicated database users with minimal required permissions
   - Use read-only access for production environments
   - Restrict access to specific databases/tables using views

2. **Recommended Setup**:
   - Start with a test environment
   - Use separate credentials for different environments (dev/staging/prod)
   - Enable apiSQL's access control policies (IP whitelist, API Key, JWT)
   - Regularly rotate API keys

3. **Data Protection**:
   - Never expose production credentials in client configurations
   - Use environment variables for sensitive information
   - Enable SSL/TLS for all connections

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- An apiSQL account (register at [open.apisql.cn](https://open.apisql.cn))

### Installation

```bash
# Install globally (optional)
npm install -g apisql-mcp

# Or run directly with npx
npx -y apisql-mcp
```

### Configuration

#### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `APISQL_MCP_API_URL` | ✅ | apiSQL API endpoint URL | `https://open.apisql.cn/api/mytest/$sudb` |
| `APISQL_MCP_API_KEY` | ✅ | API authentication key (Bearer token) | `Bearer sk-xxxxxxxx` |
| `APISQL_MCP_DS` | ❌ | Default data source name | `mysql` |

#### Getting Your API Credentials

1. Register at [open.apisql.cn](https://open.apisql.cn)
2. Create a project and install the data gateway
3. Add your database as a data source
4. Enable SUDB feature in your project settings
5. Create an access control policy with API Key authentication
6. Copy the API URL and Key from the policy page

## 🔧 MCP Client Configuration

### Claude Desktop / Claude Code

Add to your Claude Desktop configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%/Claude/claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "apisql-mcp": {
      "command": "npx",
      "args": ["-y", "apisql-mcp"],
      "env": {
        "APISQL_MCP_API_URL": "https://open.apisql.cn/api/mytest/$sudb",
        "APISQL_MCP_API_KEY": "Bearer sk-your-api-key",
        "APISQL_MCP_DS": "mysql"
      }
    }
  }
}
```

**Using Claude Code CLI:**
```bash
claude mcp add apisql-mcp --scope user -- npx apisql-mcp
```

### Cursor

Add to Cursor Settings → MCP → New MCP Server:

```json
{
  "name": "apisql-mcp",
  "command": "npx",
  "args": ["-y", "apisql-mcp"],
  "env": {
    "APISQL_MCP_API_URL": "https://open.apisql.cn/api/mytest/$sudb",
    "APISQL_MCP_API_KEY": "Bearer sk-your-api-key",
    "APISQL_MCP_DS": "mysql"
  }
}
```

### VS Code / Copilot

Add to VS Code settings (`settings.json`):

```json
{
  "mcp": {
    "servers": {
      "apisql-mcp": {
        "command": "npx",
        "args": ["-y", "apisql-mcp"],
        "env": {
          "APISQL_MCP_API_URL": "https://open.apisql.cn/api/mytest/$sudb",
          "APISQL_MCP_API_KEY": "Bearer sk-your-api-key",
          "APISQL_MCP_DS": "mysql"
        }
      }
    }
  }
}
```

### Cline

Add to your Cline MCP settings:

```json
{
  "mcpServers": {
    "apisql-mcp": {
      "command": "npx",
      "args": ["-y", "apisql-mcp"],
      "env": {
        "APISQL_MCP_API_URL": "https://open.apisql.cn/api/mytest/$sudb",
        "APISQL_MCP_API_KEY": "Bearer sk-your-api-key",
        "APISQL_MCP_DS": "mysql"
      }
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "apisql-mcp": {
      "command": "npx",
      "args": ["-y", "apisql-mcp"],
      "env": {
        "APISQL_MCP_API_URL": "https://open.apisql.cn/api/mytest/$sudb",
        "APISQL_MCP_API_KEY": "Bearer sk-your-api-key"
      }
    }
  }
}
```

### HTTP Transport Mode (Advanced)

For HTTP-based MCP clients, start the server in streamable HTTP mode:

```bash
APISQL_MCP_API_URL=https://open.apisql.cn/api/mytest/$sudb \
APISQL_MCP_API_KEY="Bearer sk-your-api-key" \
APISQL_MCP_DS=mysql \
npx apisql-mcp --transport streamable-http --port 9090 --host 0.0.0.0
```

Then configure your MCP client to connect to:
```
http://localhost:9090
```

Available options:
- `--transport <type>`: Transport type (`stdio` or `streamable-http`, default: `stdio`)
- `--port <number>`: HTTP server port (default: `9090`)
- `--host <host>`: HTTP server host (default: `127.0.0.1`)

## 💡 Usage Examples

### Basic Query (Using Default Data Source)

```json
{
  "name": "execute_sql",
  "arguments": {
    "sc": "SELECT * FROM users LIMIT 10"
  }
}
```

### Switch Data Source Dynamically

```json
// Query MySQL
{
  "name": "execute_sql",
  "arguments": {
    "sc": "SELECT * FROM orders WHERE status = 'pending'",
    "ds": "mysql"
  }
}

// Switch to PostgreSQL
{
  "name": "execute_sql",
  "arguments": {
    "sc": "SELECT * FROM customers WHERE created_at > NOW() - INTERVAL '7 days'",
    "ds": "postgresql"
  }
}

// Switch to Oracle
{
  "name": "execute_sql",
  "arguments": {
    "sc": "SELECT * FROM employees WHERE ROWNUM <= 10",
    "ds": "oracle11g"
  }
}
```

### Supported SQL Operations

- **Query**: `SELECT`, `WITH` (CTEs), `JOIN`, subqueries
- **Insert**: `INSERT INTO ... VALUES`, `INSERT INTO ... SELECT`
- **Update**: `UPDATE ... SET ... WHERE`
- **Delete**: `DELETE FROM ... WHERE`
- **Schema**: `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`, `CREATE INDEX`
- **Procedures**: Execute stored procedures and functions

### Parameterized Queries

apiSQL supports named parameters using `:paramName` syntax:

```json
{
  "name": "execute_sql",
  "arguments": {
    "sc": "SELECT * FROM users WHERE age > :minAge AND status = :status",
    "params": {
      "minAge": 18,
      "status": "active"
    }
  }
}
```

## 🗄️ Supported Databases

| Database | Type | Notes |
|----------|------|-------|
| MySQL / MariaDB | OLTP | Full support including stored procedures |
| PostgreSQL | OLTP | Full support including JSON operations |
| SQL Server | OLTP | T-SQL support |
| Oracle | OLTP | 11g, 12c, 19c, 20c+ support |
| SQLite | Embedded | File-based databases |
| StarRocks | OLAP | High-performance analytics |
| Apache Doris | OLAP | Real-time analytics |
| TiDB | Distributed | MySQL-compatible distributed SQL |
| DuckDB | Analytical | In-process analytical database |
| OceanBase | Distributed | Distributed relational database |
| Trino / Presto | Query Engine | Federated query support |
| Dameng | Domestic/Innovation | 达梦数据库 (Chinese domestic database) |
| Custom JDBC | Various | Any JDBC-compatible database |

## 🏗️ Architecture

```
┌─────────────────┐     MCP Protocol      ┌──────────────┐     HTTP/SSE      ┌─────────────┐     SUDB      ┌──────────┐
│   MCP Client    │ ◄──────────────────► │ apisql-mcp   │ ◄──────────────► │ apiSQL      │ ◄──────────► │ Database │
│  (Claude, etc.) │                      │  (This tool) │                  │ Platform    │              │          │
└─────────────────┘                      └──────────────┘                  └─────────────┘              └──────────┘
```

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/your-username/apisql-mcp.git
cd apisql-mcp

# Install dependencies
npm install

# Build TypeScript
npm run build

# Development mode with watch
npm run dev

# Run tests
npm test

# Start the server
npm start
```

## 🔍 Troubleshooting

### "APISQL_MCP_API_URL environment variable is required"
- Ensure you've set the environment variable correctly
- Check that the URL ends with `/$sudb` for SUDB functionality

### "API error: Data source does not exist"
- Verify the data source name matches exactly (case-sensitive)
- Ensure the data source is created and the gateway is online
- Check if you need to specify `dsEnv` for multi-environment data sources

### Connection Issues
- Verify your apiSQL gateway is running and connected to the platform
- Check firewall settings if running the gateway locally
- Ensure your API Key has the necessary permissions

### Character Encoding Issues (Chinese/Unicode)
- Ensure database connection charset is set to UTF-8
- Use `SET NAMES utf8mb4` in SQL statements (MySQL)
- Check that your database supports the character set you're using

## 📚 Links

- [Documentation](https://docs.apisql.cn)
- [apiSQL Platform](https://open.apisql.cn)
- [Report Issues](https://github.com/your-username/apisql-mcp/issues)
- [npm Package](https://www.npmjs.com/package/apisql-mcp)

## 📄 License

MIT © [apiSQL](https://www.apisql.cn)

## 🏷️ Keywords

mcp, sql, database, mysql, postgresql, oracle, sqlserver, sqlite, starrocks, apisql, model-context-protocol, ai, llm
