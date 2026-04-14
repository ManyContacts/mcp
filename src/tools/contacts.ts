import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, apiPut, apiDelete } from "../api-client.js";

function json(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

function err(e: unknown) {
  return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true as const };
}

const phone = z.string().describe("Phone number with country code, e.g. 34600000000");

export function registerContactTools(server: McpServer) {
  server.tool(
    "manycontacts_contacts_list",
    "List WhatsApp Business contacts with filters. Returns paginated results.",
    {
      page: z.number().optional().describe("Page number (default 1)"),
      limit: z.number().optional().describe("Results per page, max 200 (default 50)"),
      open: z.enum(["true", "false"]).optional().describe("Filter by open/closed status"),
      assigned_to: z.string().optional().describe("Filter by assigned user ID"),
      tags: z.string().optional().describe("Comma-separated tag IDs (contacts must have ALL tags)"),
      team: z.string().optional().describe("Filter by team ID"),
      stages: z.string().optional().describe("Comma-separated funnel stage IDs"),
      date_from: z.string().optional().describe("Filter updated after date (YYYY-MM-DD)"),
      date_to: z.string().optional().describe("Filter updated before date (YYYY-MM-DD, max 90 days range)"),
      unread: z.enum(["true"]).optional().describe("Only contacts with unread messages"),
      blacklist: z.enum(["true"]).optional().describe("Only blacklisted contacts"),
      scheduled: z.enum(["true"]).optional().describe("Only contacts with pending scheduled messages"),
    },
    async (params) => {
      try {
        const res = await apiGet("/contacts", params);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_contacts_get",
    "Get detailed information about a WhatsApp Business contact including tags, teams, and funnel stages",
    { phone },
    async ({ phone }) => {
      try {
        const res = await apiGet(`/contacts/${encodeURIComponent(phone)}`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_contacts_create",
    "Create a new WhatsApp Business contact in ManyContacts CRM",
    {
      phone,
      name: z.string().optional().describe("Contact name"),
      notes: z.string().optional().describe("Contact notes"),
    },
    async ({ phone, name, notes }) => {
      try {
        const res = await apiPost("/contacts", { phone, name, notes });
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_contacts_update",
    "Update an existing WhatsApp Business contact (name, notes, custom fields)",
    {
      phone,
      name: z.string().optional().describe("New contact name"),
      notes: z.string().optional().describe("New contact notes"),
      customFields: z.string().optional().describe("Custom fields as JSON string"),
    },
    async ({ phone, name, notes, customFields }) => {
      try {
        const body: Record<string, unknown> = {};
        if (name) body.name = name;
        if (notes) body.notes = notes;
        if (customFields) body.customFields = JSON.parse(customFields);
        const res = await apiPut(`/contacts/${encodeURIComponent(phone)}`, body);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_contacts_delete",
    "Delete a WhatsApp Business contact from ManyContacts CRM",
    { phone },
    async ({ phone }) => {
      try {
        const res = await apiDelete(`/contacts/${encodeURIComponent(phone)}`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_contacts_assign",
    "Assign a WhatsApp Business contact to a team member",
    {
      phone,
      userId: z.string().describe("User ID to assign the contact to"),
    },
    async ({ phone, userId }) => {
      try {
        const res = await apiPost(`/contacts/${encodeURIComponent(phone)}/assign/${userId}`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_contacts_unassign",
    "Unassign a WhatsApp Business contact (remove user assignment)",
    { phone },
    async ({ phone }) => {
      try {
        const res = await apiPost(`/contacts/${encodeURIComponent(phone)}/unassign`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_contacts_close",
    "Close a WhatsApp Business conversation",
    { phone },
    async ({ phone }) => {
      try {
        const res = await apiPost(`/contacts/${encodeURIComponent(phone)}/close`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_contacts_open",
    "Reopen a closed WhatsApp Business conversation",
    { phone },
    async ({ phone }) => {
      try {
        const res = await apiPost(`/contacts/${encodeURIComponent(phone)}/open`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_contacts_tag_add",
    "Add a tag to a WhatsApp Business contact",
    {
      phone,
      tagId: z.string().describe("Tag ID to add"),
    },
    async ({ phone, tagId }) => {
      try {
        const res = await apiPost(`/contacts/${encodeURIComponent(phone)}/tags/${tagId}`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_contacts_tag_remove",
    "Remove a tag from a WhatsApp Business contact",
    {
      phone,
      tagId: z.string().describe("Tag ID to remove"),
    },
    async ({ phone, tagId }) => {
      try {
        const res = await apiDelete(`/contacts/${encodeURIComponent(phone)}/tags/${tagId}`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_contacts_team_add",
    "Add a team to a WhatsApp Business contact",
    {
      phone,
      teamId: z.string().describe("Team ID to add"),
    },
    async ({ phone, teamId }) => {
      try {
        const res = await apiPost(`/contacts/${encodeURIComponent(phone)}/teams/${teamId}`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_contacts_team_remove",
    "Remove a team from a WhatsApp Business contact",
    {
      phone,
      teamId: z.string().describe("Team ID to remove"),
    },
    async ({ phone, teamId }) => {
      try {
        const res = await apiDelete(`/contacts/${encodeURIComponent(phone)}/teams/${teamId}`);
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_contacts_set_stage",
    "Move a WhatsApp Business contact to a funnel/pipeline stage",
    {
      phone,
      funnel_id: z.string().describe("Funnel ID"),
      stage_id: z.string().describe("Stage ID within the funnel"),
    },
    async ({ phone, funnel_id, stage_id }) => {
      try {
        const res = await apiPut(`/contacts/${encodeURIComponent(phone)}/stage`, { funnel_id, stage_id });
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );

  server.tool(
    "manycontacts_contacts_bulk",
    "Perform bulk operations on multiple WhatsApp Business contacts (close, open, assign, add_tag, add_team)",
    {
      action: z.enum(["close", "open", "assign", "add_tag", "add_team"]).describe("Bulk action to perform"),
      phones: z.string().describe("Comma-separated phone numbers"),
      value: z.string().optional().describe("Value for action (user_id for assign, tag_id for add_tag, team_id for add_team)"),
    },
    async ({ action, phones, value }) => {
      try {
        const res = await apiPost("/contacts/bulk", {
          action,
          contact_ids: phones.split(",").map((p: string) => p.trim()),
          value,
        });
        return { content: [{ type: "text", text: json(res) }] };
      } catch (e) { return err(e); }
    }
  );
}
