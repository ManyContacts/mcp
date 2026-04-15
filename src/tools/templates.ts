import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost } from "../api-client.js";

function json(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

function err(e: unknown) {
  return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true as const };
}

export function registerTemplateTools(server: McpServer) {
  server.tool(
    "manycontacts.templates.list",
    "List WhatsApp Business message templates. Templates are required for sending messages outside the 24h conversation window.",
    {
      status: z.enum(["approved", "pending", "rejected"]).optional().describe("Filter by template status"),
    },
    async ({ status }) => {
      try {
        const params: Record<string, unknown> = {};
        if (status) params.status = status;
        const res = await apiGet("/templates", params);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts.templates.get",
    "Get details of a specific WhatsApp Business message template including components and configuration",
    {
      id: z.string().describe("Template ID"),
    },
    async ({ id }) => {
      try {
        const res = await apiGet(`/templates/${id}`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts.templates.sync",
    "Sync WhatsApp Business templates from Meta Cloud API. Fetches the latest templates from the connected WhatsApp Business account.",
    {},
    async () => {
      try {
        const res = await apiPost("/templates/sync");
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );
}
