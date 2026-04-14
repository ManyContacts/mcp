import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, apiDelete } from "../api-client.js";

function json(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

function err(e: unknown) {
  return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true as const };
}

export function registerCampaignTools(server: McpServer) {
  server.tool(
    "manycontacts_campaigns_list",
    "List WhatsApp Business bulk messaging campaigns with statistics (sent, delivered, read, failed counts)",
    {},
    async () => {
      try {
        const res = await apiGet("/campaigns");
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_campaigns_create",
    "Create a WhatsApp Business bulk messaging campaign. Sends a template message to a list of phone numbers at a scheduled time.",
    {
      name: z.string().describe("Campaign name"),
      templateId: z.string().describe("WhatsApp template ID to use"),
      phones: z.string().describe("Comma-separated phone numbers to send to"),
      date: z.string().describe("Scheduled send date in ISO format, e.g. 2026-12-01T09:00:00"),
      variables: z.string().optional().describe("Template variables as JSON array, e.g. '[\"John\",\"20%\"]'"),
    },
    async ({ name, templateId, phones, date, variables }) => {
      try {
        const body: Record<string, unknown> = {
          name,
          template_id: templateId,
          phones: phones.split(",").map((p: string) => p.trim()),
          date,
        };
        if (variables) body.variables = JSON.parse(variables);
        const res = await apiPost("/campaigns", body);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_campaigns_delete",
    "Delete a WhatsApp Business campaign",
    {
      id: z.string().describe("Campaign ID to delete"),
    },
    async ({ id }) => {
      try {
        const res = await apiDelete(`/campaigns/${id}`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );
}
