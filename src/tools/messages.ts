import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost } from "../api-client.js";

function json(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

function err(e: unknown) {
  return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true as const };
}

const phone = z.string().describe("Phone number with country code, e.g. 34600000000");

export function registerMessageTools(server: McpServer) {
  server.tool(
    "manycontacts_messages_list",
    "List WhatsApp Business messages for a contact. Shows the conversation history with timestamps and status.",
    {
      phone,
      page: z.number().optional().describe("Page number (default 1)"),
      limit: z.number().optional().describe("Messages per page (default 50)"),
    },
    async ({ phone, page, limit }) => {
      try {
        const params: Record<string, unknown> = {};
        if (page) params.page = page;
        if (limit) params.limit = limit;
        const res = await apiGet(`/messages/${encodeURIComponent(phone)}`, params);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_messages_send_text",
    "Send a WhatsApp Business text message to a phone number",
    {
      phone,
      body: z.string().describe("Message text to send"),
    },
    async ({ phone, body }) => {
      try {
        const res = await apiPost(`/messages/${encodeURIComponent(phone)}/text`, { body });
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_messages_send_note",
    "Send an internal note on a WhatsApp Business contact (not visible to the contact)",
    {
      phone,
      body: z.string().describe("Internal note text"),
    },
    async ({ phone, body }) => {
      try {
        const res = await apiPost(`/messages/${encodeURIComponent(phone)}/note`, { body });
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_messages_send_template",
    "Send a WhatsApp Business template message (for outbound messaging outside the 24h window)",
    {
      phone,
      templateId: z.string().describe("Template ID to send"),
      variables: z.string().optional().describe("Template variables as JSON array, e.g. '[\"John\",\"20%\"]'"),
    },
    async ({ phone, templateId, variables }) => {
      try {
        const body: Record<string, unknown> = { template_id: templateId };
        if (variables) body.variables = JSON.parse(variables);
        const res = await apiPost(`/messages/${encodeURIComponent(phone)}/template`, body);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );
}
