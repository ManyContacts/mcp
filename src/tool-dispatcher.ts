import { configure, apiGet, apiPost, apiPut, apiDelete } from "./api-client.js";

export { configure };

function json(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

type ToolResult = { content: Array<{ type: string; text: string }>; isError?: boolean };

function ok(data: unknown): ToolResult {
  return { content: [{ type: "text", text: json(data) }] };
}

function fail(e: unknown): ToolResult {
  return { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true };
}

type Handler = (a: Record<string, any>) => Promise<ToolResult>;

const e = encodeURIComponent;

const handlers: Record<string, Handler> = {
  "manycontacts.context": async () => ok(await apiGet("/context")),

  "manycontacts.contacts.list": async (p) => ok(await apiGet("/contacts", p)),
  "manycontacts.contacts.get": async (a) => ok(await apiGet(`/contacts/${e(a.phone)}`)),
  "manycontacts.contacts.create": async (a) => ok(await apiPost("/contacts", { phone: a.phone, name: a.name, notes: a.notes })),
  "manycontacts.contacts.update": async (a) => {
    const body: Record<string, unknown> = {};
    if (a.name) body.name = a.name;
    if (a.notes) body.notes = a.notes;
    if (a.customFields) body.customFields = JSON.parse(a.customFields);
    return ok(await apiPut(`/contacts/${e(a.phone)}`, body));
  },
  "manycontacts.contacts.delete": async (a) => ok(await apiDelete(`/contacts/${e(a.phone)}`)),
  "manycontacts.contacts.assign": async (a) => ok(await apiPost(`/contacts/${e(a.phone)}/assign/${a.userId}`)),
  "manycontacts.contacts.unassign": async (a) => ok(await apiPost(`/contacts/${e(a.phone)}/unassign`)),
  "manycontacts.contacts.close": async (a) => ok(await apiPost(`/contacts/${e(a.phone)}/close`)),
  "manycontacts.contacts.open": async (a) => ok(await apiPost(`/contacts/${e(a.phone)}/open`)),
  "manycontacts.contacts.tag.add": async (a) => ok(await apiPost(`/contacts/${e(a.phone)}/tags/${a.tagId}`)),
  "manycontacts.contacts.tag.remove": async (a) => ok(await apiDelete(`/contacts/${e(a.phone)}/tags/${a.tagId}`)),
  "manycontacts.contacts.team.add": async (a) => ok(await apiPost(`/contacts/${e(a.phone)}/teams/${a.teamId}`)),
  "manycontacts.contacts.team.remove": async (a) => ok(await apiDelete(`/contacts/${e(a.phone)}/teams/${a.teamId}`)),
  "manycontacts.contacts.set_stage": async (a) => ok(await apiPut(`/contacts/${e(a.phone)}/stage`, { funnel_id: a.funnel_id, stage_id: a.stage_id })),
  "manycontacts.contacts.bulk": async (a) =>
    ok(await apiPost("/contacts/bulk", { action: a.action, contact_ids: a.phones.split(",").map((p: string) => p.trim()), value: a.value })),

  "manycontacts.messages.list": async (a) => {
    const params: Record<string, unknown> = {};
    if (a.page) params.page = a.page;
    if (a.limit) params.limit = a.limit;
    return ok(await apiGet(`/messages/${e(a.phone)}`, params));
  },
  "manycontacts.messages.send.text": async (a) => ok(await apiPost(`/messages/${e(a.phone)}/text`, { body: a.body })),
  "manycontacts.messages.send.note": async (a) => ok(await apiPost(`/messages/${e(a.phone)}/note`, { body: a.body })),
  "manycontacts.messages.send.template": async (a) => {
    const body: Record<string, unknown> = { template_id: a.templateId };
    if (a.variables) body.variables = JSON.parse(a.variables);
    return ok(await apiPost(`/messages/${e(a.phone)}/template`, body));
  },

  "manycontacts.templates.list": async (a) => {
    const params: Record<string, unknown> = {};
    if (a.status) params.status = a.status;
    return ok(await apiGet("/templates", params));
  },
  "manycontacts.templates.get": async (a) => ok(await apiGet(`/templates/${a.id}`)),
  "manycontacts.templates.sync": async () => ok(await apiPost("/templates/sync")),

  "manycontacts.campaigns.list": async () => ok(await apiGet("/campaigns")),
  "manycontacts.campaigns.create": async (a) => {
    const body: Record<string, unknown> = {
      name: a.name, template_id: a.templateId,
      phones: a.phones.split(",").map((p: string) => p.trim()), date: a.date,
    };
    if (a.variables) body.variables = JSON.parse(a.variables);
    return ok(await apiPost("/campaigns", body));
  },
  "manycontacts.campaigns.delete": async (a) => ok(await apiDelete(`/campaigns/${a.id}`)),

  "manycontacts.org.get": async () => ok(await apiGet("/organization")),
  "manycontacts.org.update": async (p) => ok(await apiPut("/organization", p)),
  "manycontacts.org.schedule.get": async () => ok(await apiGet("/organization/schedule")),
  "manycontacts.org.apikey": async () => ok(await apiGet("/organization/apikey")),

  "manycontacts.channels.list": async () => ok(await apiGet("/channels")),

  "manycontacts.tags.list": async () => ok(await apiGet("/tags")),
  "manycontacts.tags.create": async (a) => ok(await apiPost("/tags", { name: a.name, color: a.color || "#fab1a0" })),
  "manycontacts.tags.update": async (a) => {
    const body: Record<string, unknown> = {};
    if (a.name) body.name = a.name;
    if (a.color) body.color = a.color;
    return ok(await apiPut(`/tags/${a.id}`, body));
  },
  "manycontacts.tags.delete": async (a) => ok(await apiDelete(`/tags/${a.id}`)),

  "manycontacts.teams.list": async () => ok(await apiGet("/teams")),
  "manycontacts.teams.create": async (a) => ok(await apiPost("/teams", { name: a.name })),
  "manycontacts.teams.add_member": async (a) => ok(await apiPost(`/teams/${a.teamId}/members`, { user_id: a.userId })),
  "manycontacts.teams.remove_member": async (a) => ok(await apiDelete(`/teams/${a.teamId}/members/${a.userId}`)),
  "manycontacts.teams.delete": async (a) => ok(await apiDelete(`/teams/${a.id}`)),

  "manycontacts.funnels.list": async () => ok(await apiGet("/funnels")),
  "manycontacts.funnels.create": async (a) => ok(await apiPost("/funnels", { name: a.name })),
  "manycontacts.funnels.add_stage": async (a) => ok(await apiPost(`/funnels/${a.funnelId}/stages`, { name: a.name, order: a.order })),
  "manycontacts.funnels.update_stage": async (a) => {
    const body: Record<string, unknown> = {};
    if (a.name) body.name = a.name;
    return ok(await apiPut(`/funnels/${a.funnelId}/stages/${a.stageId}`, body));
  },
  "manycontacts.funnels.delete": async (a) => ok(await apiDelete(`/funnels/${a.id}`)),
  "manycontacts.funnels.contacts": async (a) => {
    const params: Record<string, unknown> = {};
    if (a.stage_id) params.stage_id = a.stage_id;
    if (a.page) params.page = a.page;
    if (a.limit) params.limit = a.limit;
    return ok(await apiGet(`/funnels/${a.funnelId}/contacts`, params));
  },

  "manycontacts.users.list": async () => ok(await apiGet("/users")),
  "manycontacts.users.get": async (a) => ok(await apiGet(`/users/${a.id}`)),
  "manycontacts.users.update": async (a) => {
    const body: Record<string, unknown> = {};
    if (a.name) body.name = a.name;
    return ok(await apiPut(`/users/${a.id}`, body));
  },
  "manycontacts.users.invite": async (a) => ok(await apiPost("/users/invite", { email: a.email })),
  "manycontacts.users.delete": async (a) => ok(await apiDelete(`/users/${a.id}`)),

  "manycontacts.ai_agents.list": async () => ok(await apiGet("/ai-agents")),
  "manycontacts.ai_agents.get": async (a) => ok(await apiGet(`/ai-agents/${a.id}`)),
  "manycontacts.ai_agents.update": async (a) => {
    const body: Record<string, unknown> = {};
    if (a.active !== undefined) body.active = a.active;
    if (a.block_1) body.block_1 = a.block_1;
    if (a.block_2) body.block_2 = a.block_2;
    if (a.block_3) body.block_3 = a.block_3;
    return ok(await apiPut(`/ai-agents/${a.id}`, body));
  },
  "manycontacts.ai_agents.feedback": async (a) => ok(await apiGet(`/ai-agents/${a.id}/feedback`)),
};

export async function callTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
  const handler = handlers[name];
  if (!handler) return fail(new Error(`Unknown tool: ${name}`));
  try {
    return await handler(args);
  } catch (err) {
    return fail(err);
  }
}

export function getToolNames(): string[] {
  return Object.keys(handlers);
}
