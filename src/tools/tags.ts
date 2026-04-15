import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, apiPut, apiDelete } from "../api-client.js";

function json(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

function err(e: unknown) {
  return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true as const };
}

export function registerTagTools(server: McpServer) {
  server.tool(
    "manycontacts.tags.list",
    "List all tags for categorizing WhatsApp Business contacts",
    {},
    async () => {
      try {
        const res = await apiGet("/tags");
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts.tags.create",
    "Create a new tag for WhatsApp Business contacts",
    {
      name: z.string().describe("Tag name"),
      color: z.string().optional().describe("Tag color hex, e.g. #ff0000 (default #fab1a0)"),
    },
    async ({ name, color }) => {
      try {
        const res = await apiPost("/tags", { name, color: color || "#fab1a0" });
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts.tags.update",
    "Update an existing WhatsApp Business contact tag",
    {
      id: z.string().describe("Tag ID"),
      name: z.string().optional().describe("New tag name"),
      color: z.string().optional().describe("New tag color hex"),
    },
    async ({ id, name, color }) => {
      try {
        const body: Record<string, unknown> = {};
        if (name) body.name = name;
        if (color) body.color = color;
        const res = await apiPut(`/tags/${id}`, body);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts.tags.delete",
    "Delete a WhatsApp Business contact tag",
    { id: z.string().describe("Tag ID to delete") },
    async ({ id }) => {
      try {
        const res = await apiDelete(`/tags/${id}`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );
}
