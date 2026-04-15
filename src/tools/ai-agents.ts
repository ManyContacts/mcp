import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPut } from "../api-client.js";

function json(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

function err(e: unknown) {
  return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true as const };
}

export function registerAiAgentTools(server: McpServer) {
  server.tool(
    "manycontacts.ai_agents.list",
    "List AI agents configured to auto-respond to WhatsApp Business messages",
    {},
    async () => {
      try {
        const res = await apiGet("/ai-agents");
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts.ai_agents.get",
    "Get details of a specific WhatsApp AI agent including scenarios and configuration",
    { id: z.string().describe("AI Agent ID (UUID)") },
    async ({ id }) => {
      try {
        const res = await apiGet(`/ai-agents/${id}`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts.ai_agents.update",
    "Update a WhatsApp AI agent's configuration (instructions, active status, etc.)",
    {
      id: z.string().describe("AI Agent ID (UUID)"),
      active: z.boolean().optional().describe("Enable or disable the agent"),
      block_1: z.string().optional().describe("Agent instructions block 1"),
      block_2: z.string().optional().describe("Agent instructions block 2"),
      block_3: z.string().optional().describe("Agent instructions block 3"),
    },
    async ({ id, ...params }) => {
      try {
        const body: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(params)) {
          if (v !== undefined) body[k] = v;
        }
        const res = await apiPut(`/ai-agents/${id}`, body);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts.ai_agents.feedback",
    "Get feedback/conversation logs for a WhatsApp AI agent",
    { id: z.string().describe("AI Agent ID (UUID)") },
    async ({ id }) => {
      try {
        const res = await apiGet(`/ai-agents/${id}/feedback`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );
}
