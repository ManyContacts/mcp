#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { configure } from "./api-client.js";
import { getToken, getApiUrl } from "./config.js";
import { createMcpServer } from "./server.js";

const token = getToken();
if (token) configure(token, getApiUrl());

const server = createMcpServer();

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ManyContacts MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
