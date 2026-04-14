import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiGet } from "../api-client.js";

function json(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function registerContextTools(server: McpServer) {
  server.tool(
    "manycontacts_context",
    "Get ManyContacts account overview: WhatsApp Business channels, contact/user/tag counts, active AI agents, and enabled features. Use this first to understand the account state.",
    {},
    async () => {
      try {
        const res = await apiGet("/context");
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e: unknown) {
        return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
      }
    }
  );
}
