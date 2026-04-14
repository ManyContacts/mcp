import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPut, apiPost, apiDelete } from "../api-client.js";

function json(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

function err(e: unknown) {
  return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true as const };
}

export function registerUserTools(server: McpServer) {
  server.tool(
    "manycontacts_users_list",
    "List team members/users in the WhatsApp Business organization",
    {},
    async () => {
      try {
        const res = await apiGet("/users");
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_users_get",
    "Get details of a specific team member/user",
    { id: z.string().describe("User ID") },
    async ({ id }) => {
      try {
        const res = await apiGet(`/users/${id}`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_users_update",
    "Update a team member/user profile",
    {
      id: z.string().describe("User ID"),
      name: z.string().optional().describe("User name"),
    },
    async ({ id, name }) => {
      try {
        const body: Record<string, unknown> = {};
        if (name) body.name = name;
        const res = await apiPut(`/users/${id}`, body);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_users_invite",
    "Invite a new team member to the WhatsApp Business organization",
    { email: z.string().describe("Email address to invite") },
    async ({ email }) => {
      try {
        const res = await apiPost("/users/invite", { email });
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_users_delete",
    "Remove a team member from the WhatsApp Business organization",
    { id: z.string().describe("User ID to remove") },
    async ({ id }) => {
      try {
        const res = await apiDelete(`/users/${id}`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );
}
