import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, apiPut, apiDelete } from "../api-client.js";

function json(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

function err(e: unknown) {
  return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true as const };
}

export function registerFunnelTools(server: McpServer) {
  server.tool(
    "manycontacts.funnels.list",
    "List sales funnels/pipelines for organizing WhatsApp Business contacts by stage",
    {},
    async () => {
      try {
        const res = await apiGet("/funnels");
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts.funnels.create",
    "Create a new sales funnel/pipeline for WhatsApp Business contacts",
    { name: z.string().describe("Funnel name") },
    async ({ name }) => {
      try {
        const res = await apiPost("/funnels", { name });
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts.funnels.add_stage",
    "Add a stage to a sales funnel/pipeline",
    {
      funnelId: z.string().describe("Funnel ID"),
      name: z.string().describe("Stage name"),
      order: z.number().describe("Stage order position"),
    },
    async ({ funnelId, name, order }) => {
      try {
        const res = await apiPost(`/funnels/${funnelId}/stages`, { name, order });
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts.funnels.update_stage",
    "Update a stage in a sales funnel/pipeline",
    {
      funnelId: z.string().describe("Funnel ID"),
      stageId: z.string().describe("Stage ID to update"),
      name: z.string().optional().describe("New stage name"),
    },
    async ({ funnelId, stageId, name }) => {
      try {
        const body: Record<string, unknown> = {};
        if (name) body.name = name;
        const res = await apiPut(`/funnels/${funnelId}/stages/${stageId}`, body);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts.funnels.delete",
    "Delete a sales funnel/pipeline",
    { id: z.string().describe("Funnel ID to delete") },
    async ({ id }) => {
      try {
        const res = await apiDelete(`/funnels/${id}`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts.funnels.contacts",
    "List contacts in a funnel/pipeline, optionally filtered by stage",
    {
      funnelId: z.string().describe("Funnel ID"),
      stage_id: z.string().optional().describe("Filter by stage ID"),
      page: z.number().optional().describe("Page number"),
      limit: z.number().optional().describe("Results per page"),
    },
    async ({ funnelId, stage_id, page, limit }) => {
      try {
        const params: Record<string, unknown> = {};
        if (stage_id) params.stage_id = stage_id;
        if (page) params.page = page;
        if (limit) params.limit = limit;
        const res = await apiGet(`/funnels/${funnelId}/contacts`, params);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );
}
