import { configure, callTool, getToolNames } from "../build/tool-dispatcher.js";
import { readFileSync } from "fs";
import { join } from "path";

const PROTOCOL_VERSION = "2025-03-26";
const SERVER_INFO = { name: "manycontacts", version: "1.1.0" };

let _tools = null;
function getTools() {
  if (_tools) return _tools;
  try {
    const card = JSON.parse(
      readFileSync(join(process.cwd(), "public/.well-known/mcp/server-card.json"), "utf-8")
    );
    _tools = card.tools || [];
  } catch {
    _tools = getToolNames().map((name) => ({ name, description: name }));
  }
  return _tools;
}

const PROMPTS = [
  {
    name: "contact-lookup",
    description: "Look up a WhatsApp contact and summarize their profile, tags, funnel stage, and recent messages",
    arguments: [
      { name: "phone", description: "Phone number in international format, e.g. +34612345678", required: true }
    ],
  },
  {
    name: "send-campaign",
    description: "Guide through creating and sending a WhatsApp bulk campaign with a template",
    arguments: [],
  },
  {
    name: "daily-dashboard",
    description: "Get a complete overview of your ManyContacts account: channels, teams, open conversations, and recent activity",
    arguments: [],
  },
  {
    name: "reply-to-contact",
    description: "Draft and send a WhatsApp message to a contact after reviewing their conversation history",
    arguments: [
      { name: "phone", description: "Phone number in international format, e.g. +34612345678", required: true },
      { name: "message", description: "The message text to send", required: true },
    ],
  },
  {
    name: "manage-funnel",
    description: "View sales funnels, their stages, and contacts in each stage to manage your sales pipeline",
    arguments: [],
  },
  {
    name: "bulk-tag-contacts",
    description: "Tag multiple WhatsApp contacts at once by applying a tag to a list of phone numbers",
    arguments: [
      { name: "phones", description: "Comma-separated phone numbers, e.g. +34612345678,+34698765432", required: true },
      { name: "tagName", description: "Name of the tag to apply", required: true },
    ],
  },
];

function getPromptMessages(name, args) {
  switch (name) {
    case "contact-lookup":
      return [{
        role: "user",
        content: {
          type: "text",
          text: `Look up the WhatsApp contact ${args.phone}. Use manycontacts.contacts.get to fetch their profile, then manycontacts.messages.list to get recent messages. Summarize: name, tags, assigned agent, funnel stage, and the last 5 messages with timestamps.`,
        },
      }];
    case "send-campaign":
      return [{
        role: "user",
        content: {
          type: "text",
          text: `Help me create a WhatsApp campaign. First, use manycontacts.templates.list to show available approved templates. Then ask me which template to use, which contacts to target, and the scheduled date. Finally, use manycontacts.campaigns.create to set it up. Explain each step clearly.`,
        },
      }];
    case "daily-dashboard":
      return [{
        role: "user",
        content: {
          type: "text",
          text: `Generate a daily dashboard for my ManyContacts account. Use these tools in order:\n1. manycontacts.context — account overview\n2. manycontacts.channels.list — active WhatsApp channels\n3. manycontacts.contacts.list with status=open — open conversations\n4. manycontacts.teams.list — team structure\n5. manycontacts.funnels.list — sales funnels summary\nPresent the results as a concise dashboard with key metrics and action items.`,
        },
      }];
    case "reply-to-contact":
      return [{
        role: "user",
        content: {
          type: "text",
          text: `I want to reply to ${args.phone} with: "${args.message}". First use manycontacts.messages.list to show me the last 3 messages for context. Then use manycontacts.messages.send.text to send my reply. Confirm when sent.`,
        },
      }];
    case "manage-funnel":
      return [{
        role: "user",
        content: {
          type: "text",
          text: `Show me my sales pipeline. Use manycontacts.funnels.list to get all funnels and stages. For each funnel, use manycontacts.funnels.contacts to show how many contacts are in each stage. Present this as a visual pipeline summary with counts per stage.`,
        },
      }];
    case "bulk-tag-contacts":
      return [{
        role: "user",
        content: {
          type: "text",
          text: `I want to tag these contacts with "${args.tagName}": ${args.phones}. First use manycontacts.tags.list to find the tag ID for "${args.tagName}" (create it with manycontacts.tags.create if it doesn't exist). Then use manycontacts.contacts.bulk with action "add_tag" to apply the tag to all contacts. Report how many were updated.`,
        },
      }];
    default:
      return null;
  }
}

function rpc(id, result) {
  return { jsonrpc: "2.0", id, result };
}
function rpcErr(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET") {
    return res.status(405).json({ error: "Use POST for MCP JSON-RPC requests" });
  }
  if (req.method === "DELETE") {
    return res.status(200).json({ ok: true });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body;
  if (!body || !body.method) {
    return res.status(400).json(rpcErr(null, -32600, "Invalid request"));
  }

  const { method, params, id } = body;

  switch (method) {
    case "initialize":
      return res.json(
        rpc(id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {
            tools: { listChanged: false },
            prompts: { listChanged: false },
            resources: {},
          },
          serverInfo: SERVER_INFO,
        })
      );

    case "notifications/initialized":
      return res.status(204).end();

    case "tools/list":
      return res.json(rpc(id, { tools: getTools() }));

    case "prompts/list":
      return res.json(rpc(id, { prompts: PROMPTS }));

    case "prompts/get": {
      const msgs = getPromptMessages(params.name, params.arguments || {});
      if (!msgs) {
        return res.json(rpcErr(id, -32602, `Unknown prompt: ${params.name}`));
      }
      return res.json(rpc(id, { messages: msgs }));
    }

    case "resources/list":
      return res.json(rpc(id, { resources: [] }));

    case "tools/call": {
      const token =
        req.headers["x-mc-token"] ||
        (req.headers["authorization"] || "").replace("Bearer ", "") ||
        "";

      if (!token) {
        return res.json(
          rpc(id, {
            content: [
              {
                type: "text",
                text: "Error: Missing authentication. Provide your CLI token via x-mc-token header or Authorization: Bearer <token>",
              },
            ],
            isError: true,
          })
        );
      }

      configure(token);
      const result = await callTool(params.name, params.arguments || {});
      return res.json(rpc(id, result));
    }

    case "ping":
      return res.json(rpc(id, {}));

    default:
      return res.json(rpcErr(id, -32601, `Method not found: ${method}`));
  }
}
