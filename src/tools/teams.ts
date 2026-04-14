import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, apiDelete } from "../api-client.js";

function json(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

function err(e: unknown) {
  return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true as const };
}

export function registerTeamTools(server: McpServer) {
  server.tool(
    "manycontacts_teams_list",
    "List teams in the WhatsApp Business organization",
    {},
    async () => {
      try {
        const res = await apiGet("/teams");
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_teams_create",
    "Create a new team in the WhatsApp Business organization",
    { name: z.string().describe("Team name") },
    async ({ name }) => {
      try {
        const res = await apiPost("/teams", { name });
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_teams_add_member",
    "Add a user to a team",
    {
      teamId: z.string().describe("Team ID"),
      userId: z.string().describe("User ID to add"),
    },
    async ({ teamId, userId }) => {
      try {
        const res = await apiPost(`/teams/${teamId}/members`, { user_id: userId });
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_teams_remove_member",
    "Remove a user from a team",
    {
      teamId: z.string().describe("Team ID"),
      userId: z.string().describe("User ID to remove"),
    },
    async ({ teamId, userId }) => {
      try {
        const res = await apiDelete(`/teams/${teamId}/members/${userId}`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_teams_delete",
    "Delete a team from the WhatsApp Business organization",
    { id: z.string().describe("Team ID to delete") },
    async ({ id }) => {
      try {
        const res = await apiDelete(`/teams/${id}`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );
}
