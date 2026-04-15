import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { registerContextTools } from "./tools/context.js";
import { registerContactTools } from "./tools/contacts.js";
import { registerMessageTools } from "./tools/messages.js";
import { registerTemplateTools } from "./tools/templates.js";
import { registerCampaignTools } from "./tools/campaigns.js";
import { registerOrganizationTools } from "./tools/organization.js";
import { registerUserTools } from "./tools/users.js";
import { registerTagTools } from "./tools/tags.js";
import { registerTeamTools } from "./tools/teams.js";
import { registerFunnelTools } from "./tools/funnels.js";
import { registerAiAgentTools } from "./tools/ai-agents.js";
import { registerChannelTools } from "./tools/channels.js";

function registerPrompts(server: McpServer) {
  server.prompt(
    "contact-lookup",
    "Look up a WhatsApp contact and summarize their profile, tags, funnel stage, and recent messages",
    { phone: z.string().describe("Phone number in international format, e.g. +34612345678") },
    async ({ phone }) => ({
      messages: [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Look up the WhatsApp contact ${phone}. Use manycontacts.contacts.get to fetch their profile, then manycontacts.messages.list to get recent messages. Summarize: name, tags, assigned agent, funnel stage, and the last 5 messages with timestamps.`,
        },
      }],
    })
  );

  server.prompt(
    "send-campaign",
    "Guide through creating and sending a WhatsApp bulk campaign with a template",
    {},
    async () => ({
      messages: [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Help me create a WhatsApp campaign. First, use manycontacts.templates.list to show available approved templates. Then ask me which template to use, which contacts to target, and the scheduled date. Finally, use manycontacts.campaigns.create to set it up. Explain each step clearly.`,
        },
      }],
    })
  );

  server.prompt(
    "daily-dashboard",
    "Get a complete overview of your ManyContacts account: channels, teams, open conversations, and recent activity",
    {},
    async () => ({
      messages: [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Generate a daily dashboard for my ManyContacts account. Use these tools in order:
1. manycontacts.context — account overview
2. manycontacts.channels.list — active WhatsApp channels
3. manycontacts.contacts.list with status=open — open conversations
4. manycontacts.teams.list — team structure
5. manycontacts.funnels.list — sales funnels summary
Present the results as a concise dashboard with key metrics and action items.`,
        },
      }],
    })
  );

  server.prompt(
    "reply-to-contact",
    "Draft and send a WhatsApp message to a contact after reviewing their conversation history",
    {
      phone: z.string().describe("Phone number in international format, e.g. +34612345678"),
      message: z.string().describe("The message text to send"),
    },
    async ({ phone, message }) => ({
      messages: [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `I want to reply to ${phone} with: "${message}". First use manycontacts.messages.list to show me the last 3 messages for context. Then use manycontacts.messages.send.text to send my reply. Confirm when sent.`,
        },
      }],
    })
  );

  server.prompt(
    "manage-funnel",
    "View sales funnels, their stages, and contacts in each stage to manage your sales pipeline",
    {},
    async () => ({
      messages: [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Show me my sales pipeline. Use manycontacts.funnels.list to get all funnels and stages. For each funnel, use manycontacts.funnels.contacts to show how many contacts are in each stage. Present this as a visual pipeline summary with counts per stage.`,
        },
      }],
    })
  );

  server.prompt(
    "bulk-tag-contacts",
    "Tag multiple WhatsApp contacts at once by applying a tag to a list of phone numbers",
    {
      phones: z.string().describe("Comma-separated phone numbers, e.g. +34612345678,+34698765432"),
      tagName: z.string().describe("Name of the tag to apply"),
    },
    async ({ phones, tagName }) => ({
      messages: [{
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `I want to tag these contacts with "${tagName}": ${phones}. First use manycontacts.tags.list to find the tag ID for "${tagName}" (create it with manycontacts.tags.create if it doesn't exist). Then use manycontacts.contacts.bulk with action "add_tag" to apply the tag to all contacts. Report how many were updated.`,
        },
      }],
    })
  );
}

export function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: "manycontacts",
      version: "1.1.0",
    },
    {
      instructions:
        "ManyContacts MCP server for WhatsApp Business operations. " +
        "Use these tools when the user needs to: send WhatsApp messages, " +
        "manage WhatsApp Business contacts and CRM, create WhatsApp bulk messaging campaigns, " +
        "configure AI agents for WhatsApp auto-replies, manage WhatsApp Business channels, " +
        "organize contacts with tags/teams/funnels, manage message templates, " +
        "or any CRM operation related to WhatsApp Business. " +
        "Start with manycontacts.context to understand the account state.",
    }
  );

  registerContextTools(server);
  registerContactTools(server);
  registerMessageTools(server);
  registerTemplateTools(server);
  registerCampaignTools(server);
  registerOrganizationTools(server);
  registerUserTools(server);
  registerTagTools(server);
  registerTeamTools(server);
  registerFunnelTools(server);
  registerAiAgentTools(server);
  registerChannelTools(server);
  registerPrompts(server);

  return server;
}
