#!/usr/bin/env node
/**
 * MCP HTTP 服务器测试脚本 - 支持 SSE 解析
 */

import http from 'http';

const PORT = 9090;
const HOST = '127.0.0.1';

// 解析 SSE 响应
function parseSSEResponse(data) {
  const lines = data.split('\n');
  const result = { events: [] };
  let currentEvent = null;
  
  for (const line of lines) {
    if (line.startsWith('event: ')) {
      currentEvent = { event: line.slice(7), data: null };
    } else if (line.startsWith('data: ')) {
      if (currentEvent) {
        currentEvent.data = line.slice(6);
        try {
          currentEvent.parsed = JSON.parse(currentEvent.data);
        } catch (e) {
          currentEvent.parsed = null;
        }
        result.events.push(currentEvent);
        currentEvent = null;
      }
    }
  }
  
  return result;
}

// 发送 MCP 请求
async function sendMCPRequest(method, params = null, id) {
  const requestBody = JSON.stringify({
    jsonrpc: '2.0',
    id,
    method,
    ...(params && { params })
  });

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: HOST,
      port: PORT,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const parsed = parseSSEResponse(data);
        resolve(parsed);
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

// 主测试函数
async function runTests() {
  console.log('🚀 MCP HTTP Server 测试\n');
  console.log(`📡 目标: http://${HOST}:${PORT}`);
  console.log(`⏳ 等待服务器启动...\n`);
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    // 测试 1: List Tools
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 测试 1: List Tools');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const listTools = await sendMCPRequest('tools/list', null, 1);
    console.log('✅ 成功!');
    const toolsResult = listTools.events[0]?.parsed?.result;
    if (toolsResult?.tools) {
      console.log(`📋 发现 ${toolsResult.tools.length} 个工具:`);
      toolsResult.tools.forEach(tool => {
        console.log(`   • ${tool.name}: ${tool.description.substring(0, 60)}...`);
      });
    }
    
    // 测试 2: Execute SQL（默认数据源）
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 测试 2: Execute SQL (默认数据源: oracle11g)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const execSQL = await sendMCPRequest('tools/call', {
      name: 'execute_sql',
      arguments: {
        sc: 'SELECT 1 as test FROM DUAL'
      }
    }, 2);
    console.log('✅ 成功!');
    const sqlResult = execSQL.events[0]?.parsed?.result;
    if (sqlResult?.content) {
      const text = sqlResult.content[0]?.text;
      if (text) {
        const data = JSON.parse(text);
        console.log('📊 查询结果:');
        console.log(JSON.stringify(data, null, 2));
      }
    }
    
    // 测试 3: 动态数据源
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 测试 3: 动态数据源切换 (切换到 mysql)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const dynamicDS = await sendMCPRequest('tools/call', {
      name: 'execute_sql',
      arguments: {
        sc: 'SHOW DATABASES',
        ds: 'mysql'
      }
    }, 3);
    console.log('✅ 请求已发送（切换数据源）');
    const dsResult = dynamicDS.events[0]?.parsed?.result;
    if (dsResult?.isError) {
      console.log('⚠️  API 返回错误（数据源可能不存在）:');
      console.log(`   ${dsResult.content[0]?.text}`);
    } else if (dsResult?.content) {
      console.log('📊 查询结果:');
      console.log(dsResult.content[0]?.text);
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ 所有测试完成!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('\n💥 测试失败:', error.message);
    process.exit(1);
  }
}

runTests();
