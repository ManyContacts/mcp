import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

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

export function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: "manycontacts",
      version: "1.0.0",
    },
    {
      instructions:
        "ManyContacts MCP server for WhatsApp Business operations. " +
        "Use these tools when the user needs to: send WhatsApp messages, " +
        "manage WhatsApp Business contacts and CRM, create WhatsApp bulk messaging campaigns, " +
        "configure AI agents for WhatsApp auto-replies, manage WhatsApp Business channels, " +
        "organize contacts with tags/teams/funnels, manage message templates, " +
        "or any CRM operation related to WhatsApp Business. " +
        "Start with manycontacts_context to understand the account state.",
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

  return server;
}
