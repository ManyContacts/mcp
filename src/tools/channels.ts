import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiGet } from "../api-client.js";

function json(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

function err(e: unknown) {
  return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true as const };
}

export function registerChannelTools(server: McpServer) {
  server.tool(
    "manycontacts_channels_list",
    "List connected WhatsApp Business and Instagram channels",
    {},
    async () => {
      try {
        const res = await apiGet("/channels");
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );
}
