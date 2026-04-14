# ManyContacts MCP Server

MCP (Model Context Protocol) server for [ManyContacts](https://manycontacts.com) — the WhatsApp Business CRM. Enables AI agents (Claude, Cursor, Cowork, etc.) to manage contacts, send WhatsApp messages, run campaigns, configure AI auto-replies, and perform all CRM operations.

## Quick Start

### 1. Get your CLI token

```bash
npm install -g @manycontacts/cli
mc auth login --email user@example.com --password mypassword
mc auth whoami   # verify it works
```

### 2. Configure in your MCP client

#### Claude Desktop / Claude Code

Add to your MCP settings (`~/.claude/claude_desktop_config.json` or similar):

```json
{
  "mcpServers": {
    "manycontacts": {
      "command": "npx",
      "args": ["@manycontacts/mcp"],
      "env": {
        "MC_CLI_TOKEN": "your-cli-token-here"
      }
    }
  }
}
```

#### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "manycontacts": {
      "command": "npx",
      "args": ["@manycontacts/mcp"],
      "env": {
        "MC_CLI_TOKEN": "your-cli-token-here"
      }
    }
  }
}
```

If you've already logged in via the CLI (`mc auth login`), the token is stored in `~/.manycontacts` and the MCP server will pick it up automatically — no `MC_CLI_TOKEN` env var needed.

## Available Tools

### Account

| Tool | Description |
|---|---|
| `manycontacts_context` | Get account overview: channels, counts, features |
| `manycontacts_org_get` | Get organization settings |
| `manycontacts_org_update` | Update org settings (timezone, auto-reply, webhooks) |
| `manycontacts_org_schedule_get` | Get business hours schedule |
| `manycontacts_channels_list` | List connected WhatsApp/Instagram channels |

### Contacts

| Tool | Description |
|---|---|
| `manycontacts_contacts_list` | List contacts with filters (tags, team, date, unread, etc.) |
| `manycontacts_contacts_get` | Get contact details (tags, teams, funnel stages) |
| `manycontacts_contacts_create` | Create a new contact |
| `manycontacts_contacts_update` | Update contact (name, notes, custom fields) |
| `manycontacts_contacts_delete` | Delete a contact |
| `manycontacts_contacts_assign` | Assign contact to a team member |
| `manycontacts_contacts_unassign` | Remove user assignment |
| `manycontacts_contacts_close` | Close a conversation |
| `manycontacts_contacts_open` | Reopen a conversation |
| `manycontacts_contacts_tag_add` | Add a tag to a contact |
| `manycontacts_contacts_tag_remove` | Remove a tag from a contact |
| `manycontacts_contacts_team_add` | Add a team to a contact |
| `manycontacts_contacts_team_remove` | Remove a team from a contact |
| `manycontacts_contacts_set_stage` | Move contact to a funnel stage |
| `manycontacts_contacts_bulk` | Bulk operations (close, assign, tag, team) |

### Messaging

| Tool | Description |
|---|---|
| `manycontacts_messages_list` | List conversation messages |
| `manycontacts_messages_send_text` | Send a WhatsApp text message |
| `manycontacts_messages_send_note` | Send an internal note |
| `manycontacts_messages_send_template` | Send a template message (outside 24h window) |

### Templates

| Tool | Description |
|---|---|
| `manycontacts_templates_list` | List WhatsApp message templates |
| `manycontacts_templates_get` | Get template details |
| `manycontacts_templates_sync` | Sync templates from Meta Cloud API |

### Campaigns

| Tool | Description |
|---|---|
| `manycontacts_campaigns_list` | List bulk messaging campaigns |
| `manycontacts_campaigns_create` | Create a campaign (template + phone list + schedule) |
| `manycontacts_campaigns_delete` | Delete a campaign |

### Settings

| Tool | Description |
|---|---|
| `manycontacts_tags_list` | List tags |
| `manycontacts_tags_create` | Create a tag |
| `manycontacts_tags_update` | Update a tag |
| `manycontacts_tags_delete` | Delete a tag |
| `manycontacts_teams_list` | List teams |
| `manycontacts_teams_create` | Create a team |
| `manycontacts_teams_add_member` | Add user to a team |
| `manycontacts_teams_remove_member` | Remove user from a team |
| `manycontacts_teams_delete` | Delete a team |
| `manycontacts_funnels_list` | List sales funnels |
| `manycontacts_funnels_create` | Create a funnel |
| `manycontacts_funnels_add_stage` | Add a stage to a funnel |
| `manycontacts_funnels_contacts` | List contacts in a funnel |
| `manycontacts_funnels_delete` | Delete a funnel |
| `manycontacts_users_list` | List team members |
| `manycontacts_users_get` | Get user details |
| `manycontacts_users_invite` | Invite a new team member |
| `manycontacts_users_delete` | Remove a team member |
| `manycontacts_ai_agents_list` | List AI auto-reply agents |
| `manycontacts_ai_agents_get` | Get AI agent details |
| `manycontacts_ai_agents_update` | Update AI agent configuration |
| `manycontacts_ai_agents_feedback` | Get AI agent conversation logs |

## Environment Variables

| Variable | Description |
|---|---|
| `MC_CLI_TOKEN` | ManyContacts CLI authentication token |
| `MC_API_URL` | API base URL (default: `https://api.manycontacts.com`) |

## License

MIT
