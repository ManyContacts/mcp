import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPut } from "../api-client.js";

function json(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

function err(e: unknown) {
  return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true as const };
}

export function registerOrganizationTools(server: McpServer) {
  server.tool(
    "manycontacts.org.get",
    "Get WhatsApp Business organization/account information (name, timezone, settings)",
    {},
    async () => {
      try {
        const res = await apiGet("/organization");
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts.org.update",
    "Update WhatsApp Business organization settings (timezone, auto-reply, webhooks, etc.)",
    {
      timezone: z.string().optional().describe("Timezone, e.g. Europe/Madrid"),
      auto_reply_open: z.boolean().optional().describe("Enable auto-reply on chat open"),
      auto_reply_open_text: z.string().optional().describe("Auto-reply text when chat opens"),
      auto_reply_close: z.boolean().optional().describe("Enable auto-reply on chat close"),
      auto_reply_close_text: z.string().optional().describe("Auto-reply text when chat closes"),
      auto_reply_close_minutes: z.number().optional().describe("Minutes before auto-close"),
      auto_reply_away: z.boolean().optional().describe("Enable away auto-reply"),
      auto_reply_away_text: z.string().optional().describe("Away auto-reply text"),
      webhooks_forward: z.boolean().optional().describe("Enable webhook forwarding"),
      webhooks_forward_url: z.string().optional().describe("Webhook forward URL"),
    },
    async (params) => {
      try {
        const res = await apiPut("/organization", params);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts.org.schedule.get",
    "Get the business hours schedule for the WhatsApp Business account",
    {},
    async () => {
      try {
        const res = await apiGet("/organization/schedule");
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts.org.apikey",
    "Get the organization API key",
    {},
    async () => {
      try {
        const res = await apiGet("/organization/apikey");
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );
}
