
demo param 
```bash
export APISQL_MCP_API_URL='https://open.apisql.cn/api/mytest/$sudb' 、
export APISQL_MCP_API_KEY='Bearer sk-7dd9b66d38f8aff81f091ecfcf259f70'
export APISQL_MCP_DS='mysql'
```


{
  "mcpServers": {
    "apisql-mcp": {
      "command": "npx",
      "args": ["-y", "apisql-mcp"],
      "env": {
        "APISQL_MCP_API_URL": "https://open.apisql.cn/api/mytest/$sudb",
        "APISQL_MCP_API_KEY": "Bearer sk-7dd9b66d38f8aff81f091ecfcf259f70",
        "APISQL_MCP_DS": "mysql"
      }
    }
  }
}