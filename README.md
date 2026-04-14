# ManyContacts MCP Server

MCP (Model Context Protocol) server for [ManyContacts](https://manycontacts.com) — the WhatsApp Business CRM. Enables AI agents (Claude, Cursor, Windsurf, etc.) to manage contacts, send WhatsApp messages, run campaigns, configure AI auto-replies, and perform all CRM operations programmatically.

## Quick Start

### 1. Get your CLI token

```bash
npm install -g @manycontacts/cli
```

**Already have an account?** Log in:

```bash
mc auth login --email user@example.com --password mypassword
mc auth whoami   # verify it works
```

**New to ManyContacts?** Create an account and connect your WhatsApp channel:

```bash
# Register a new account
mc auth register --email user@example.com --name "My Company"

# Connect a WhatsApp Business channel (choose one method):
mc channels connect whatsapp-api      # WhatsApp Cloud API (recommended)
mc channels connect coexistence       # ManyContacts coexistence mode
mc channels connect qr                # QR code pairing

# Verify everything is set up
mc auth whoami
mc channels list
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

> **Tip:** If you've already logged in via the CLI (`mc auth login`), the token is stored in `~/.manycontacts/config.json` and the MCP server will pick it up automatically — no `MC_CLI_TOKEN` env var needed.

---

## Available Tools (47 total)

### Account & Context

#### `manycontacts_context`

Get a full overview of your ManyContacts account: connected WhatsApp Business channels, contact/user/tag counts, active AI agents, and enabled features. **Use this first** to understand the account state before performing other operations.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters needed |

---

#### `manycontacts_org_get`

Get WhatsApp Business organization/account information including name, timezone, and all configuration settings.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters needed |

---

#### `manycontacts_org_update`

Update organization-level settings such as timezone, auto-reply messages, auto-close behavior, and webhook configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `timezone` | `string` | No | Timezone identifier (e.g. `Europe/Madrid`, `America/New_York`) |
| `auto_reply_open` | `boolean` | No | Enable auto-reply when a new chat is opened |
| `auto_reply_open_text` | `string` | No | Auto-reply message text when chat opens |
| `auto_reply_close` | `boolean` | No | Enable auto-reply when a chat is closed |
| `auto_reply_close_text` | `string` | No | Auto-reply message text when chat closes |
| `auto_reply_close_minutes` | `number` | No | Minutes of inactivity before auto-close |
| `auto_reply_away` | `boolean` | No | Enable away/out-of-hours auto-reply |
| `auto_reply_away_text` | `string` | No | Away auto-reply message text |
| `webhooks_forward` | `boolean` | No | Enable webhook forwarding to an external URL |
| `webhooks_forward_url` | `string` | No | External URL to forward webhook events to |

---

#### `manycontacts_org_schedule_get`

Get the business hours schedule. Returns the configured working hours for each day of the week, used to determine when the "away" auto-reply activates.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters needed |

---

#### `manycontacts_org_apikey`

Get the organization's REST API key for direct API integrations.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters needed |

---

#### `manycontacts_channels_list`

List all connected WhatsApp Business and Instagram channels. For WhatsApp channels, shows the phone number and connection status. For Instagram channels, shows the username.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters needed |

---

### Contacts

All contact operations use phone numbers as identifiers (with country code, no `+` prefix, e.g. `34600000000`).

#### `manycontacts_contacts_list`

List WhatsApp Business contacts with advanced filters. Returns paginated results with `has_more` indicator. Filters can be combined freely.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | `number` | No | Page number (default: `1`) |
| `limit` | `number` | No | Results per page, max `200` (default: `50`) |
| `open` | `"true"` \| `"false"` | No | Filter by conversation open/closed status |
| `assigned_to` | `string` | No | Filter by assigned user ID |
| `tags` | `string` | No | Comma-separated tag IDs — contacts must have **all** specified tags |
| `team` | `string` | No | Filter by team ID |
| `stages` | `string` | No | Comma-separated funnel stage IDs |
| `date_from` | `string` | No | Filter contacts updated after this date (`YYYY-MM-DD`) |
| `date_to` | `string` | No | Filter contacts updated before this date (`YYYY-MM-DD`) |
| `unread` | `"true"` | No | Only contacts with unread messages |
| `blacklist` | `"true"` | No | Only blacklisted contacts |
| `scheduled` | `"true"` | No | Only contacts with pending scheduled messages |

> **Note:** When using `date_from` and `date_to` together, the range cannot exceed 90 days.

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "name": "John Doe",
      "number": "34600000000",
      "open": true,
      "last_user_id": "uuid-of-assigned-user",
      "source": "whatsapp",
      "notes": "VIP customer",
      "customFields": {},
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 50, "has_more": true }
}
```

---

#### `manycontacts_contacts_get`

Get detailed information about a specific contact including their tags, teams, funnel stages, and custom fields.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | `string` | **Yes** | Phone number with country code (e.g. `34600000000`) |

---

#### `manycontacts_contacts_create`

Create a new WhatsApp Business contact in the CRM. The phone number will be normalized automatically (leading `+` removed).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | `string` | **Yes** | Phone number with country code (e.g. `34600000000`) |
| `name` | `string` | No | Contact display name |
| `notes` | `string` | No | Free-text notes for the contact |

---

#### `manycontacts_contacts_update`

Update an existing contact's name, notes, or custom fields.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | `string` | **Yes** | Phone number of the contact to update |
| `name` | `string` | No | New contact name |
| `notes` | `string` | No | New contact notes |
| `customFields` | `string` | No | Custom fields as a JSON string (e.g. `'{"company":"Acme"}'`) |

---

#### `manycontacts_contacts_delete`

Permanently delete a contact from the CRM.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | `string` | **Yes** | Phone number of the contact to delete |

---

#### `manycontacts_contacts_assign`

Assign a contact to a specific team member. The assigned user will see this contact in their personal inbox.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | `string` | **Yes** | Phone number of the contact |
| `userId` | `string` | **Yes** | User ID to assign the contact to (use `manycontacts_users_list` to get IDs) |

---

#### `manycontacts_contacts_unassign`

Remove the current user assignment from a contact. The contact returns to the general unassigned inbox.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | `string` | **Yes** | Phone number of the contact |

---

#### `manycontacts_contacts_close`

Close a WhatsApp conversation. Closed conversations are archived and won't appear in the active inbox.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | `string` | **Yes** | Phone number of the contact |

---

#### `manycontacts_contacts_open`

Reopen a previously closed WhatsApp conversation. The contact will appear again in the active inbox.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | `string` | **Yes** | Phone number of the contact |

---

#### `manycontacts_contacts_tag_add`

Add a tag to a contact. Use `manycontacts_tags_list` to get available tag IDs.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | `string` | **Yes** | Phone number of the contact |
| `tagId` | `string` | **Yes** | Tag ID to add |

---

#### `manycontacts_contacts_tag_remove`

Remove a tag from a contact.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | `string` | **Yes** | Phone number of the contact |
| `tagId` | `string` | **Yes** | Tag ID to remove |

---

#### `manycontacts_contacts_team_add`

Add a team to a contact. Use `manycontacts_teams_list` to get available team IDs.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | `string` | **Yes** | Phone number of the contact |
| `teamId` | `string` | **Yes** | Team ID to add |

---

#### `manycontacts_contacts_team_remove`

Remove a team from a contact.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | `string` | **Yes** | Phone number of the contact |
| `teamId` | `string` | **Yes** | Team ID to remove |

---

#### `manycontacts_contacts_set_stage`

Move a contact to a specific stage within a sales funnel/pipeline. Use `manycontacts_funnels_list` to get funnel and stage IDs.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | `string` | **Yes** | Phone number of the contact |
| `funnel_id` | `string` | **Yes** | Funnel ID |
| `stage_id` | `string` | **Yes** | Target stage ID within the funnel |

---

#### `manycontacts_contacts_bulk`

Perform bulk operations on multiple contacts at once. Supports closing, opening, assigning, tagging, and team assignment.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | `"close"` \| `"open"` \| `"assign"` \| `"add_tag"` \| `"add_team"` | **Yes** | Bulk action to perform |
| `phones` | `string` | **Yes** | Comma-separated phone numbers (e.g. `"34600000000,34600000001"`) |
| `value` | `string` | No | Value required by the action: user ID for `assign`, tag ID for `add_tag`, team ID for `add_team`. Not needed for `close` or `open`. |

---

### Messaging

#### `manycontacts_messages_list`

List WhatsApp conversation messages for a contact. Returns messages in a conversation-friendly format with timestamps, status, and sender information.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | `string` | **Yes** | Phone number of the contact |
| `page` | `number` | No | Page number (default: `1`) |
| `limit` | `number` | No | Messages per page (default: `50`) |

---

#### `manycontacts_messages_send_text`

Send a WhatsApp text message to a contact. Only works within the 24-hour conversation window. Use `manycontacts_messages_send_template` to initiate conversations outside this window.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | `string` | **Yes** | Phone number to send the message to |
| `body` | `string` | **Yes** | Message text content |

---

#### `manycontacts_messages_send_note`

Create an internal note on a contact's conversation. Notes are only visible to team members and are **not** sent to the WhatsApp contact.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | `string` | **Yes** | Phone number of the contact |
| `body` | `string` | **Yes** | Internal note text |

---

#### `manycontacts_messages_send_template`

Send a WhatsApp Business template message. Templates are required to initiate conversations outside the 24-hour window or for bulk outbound messaging. Templates must be pre-approved by Meta.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | `string` | **Yes** | Phone number to send the template to |
| `templateId` | `string` | **Yes** | Template ID (use `manycontacts_templates_list` to get IDs) |
| `variables` | `string` | No | Template variables as a JSON array string (e.g. `'["John","20%"]'`) |

---

### Templates

WhatsApp Business templates are pre-approved message formats required for outbound messaging outside the 24-hour conversation window.

#### `manycontacts_templates_list`

List all WhatsApp Business message templates. Shows template name, code, status, components, and media flags.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | `"approved"` \| `"pending"` \| `"rejected"` | No | Filter templates by approval status |

---

#### `manycontacts_templates_get`

Get full details of a specific template including its components (header, body, footer, buttons), configuration, and media attachments.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | **Yes** | Template ID |

---

#### `manycontacts_templates_sync`

Sync WhatsApp Business templates from Meta Cloud API. Fetches the latest templates from the connected WhatsApp Business account. Useful after creating or modifying templates in the Meta Business Manager.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters needed |

---

### Campaigns

Campaigns allow bulk sending of WhatsApp template messages to a list of phone numbers at a scheduled time.

#### `manycontacts_campaigns_list`

List all WhatsApp Business bulk messaging campaigns with statistics (sent, delivered, read, and failed counts), template names, and scheduled dates.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters needed |

---

#### `manycontacts_campaigns_create`

Create a new WhatsApp Business bulk messaging campaign. The campaign will send a template message to the specified phone numbers at the scheduled time.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | **Yes** | Campaign name |
| `templateId` | `string` | **Yes** | WhatsApp template ID to use (must be `approved`) |
| `phones` | `string` | **Yes** | Comma-separated phone numbers (e.g. `"34600000000,34600000001,34600000002"`) |
| `date` | `string` | **Yes** | Scheduled send date in ISO format (e.g. `"2026-12-01T09:00:00"`) |
| `variables` | `string` | No | Template variables as a JSON array string (e.g. `'["John","20%"]'`) |

---

#### `manycontacts_campaigns_delete`

Delete a WhatsApp Business campaign. Only pending (not yet sent) campaigns can be deleted.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | **Yes** | Campaign ID to delete |

---

### Tags

Tags are colored labels used to categorize and filter WhatsApp Business contacts (e.g. "VIP", "Support", "Lead").

#### `manycontacts_tags_list`

List all available tags with their names, colors, and IDs.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters needed |

---

#### `manycontacts_tags_create`

Create a new tag for categorizing contacts.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | **Yes** | Tag name |
| `color` | `string` | No | Tag color as hex code (e.g. `"#ff0000"`). Defaults to `#fab1a0` |

---

#### `manycontacts_tags_update`

Update an existing tag's name or color.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | **Yes** | Tag ID to update |
| `name` | `string` | No | New tag name |
| `color` | `string` | No | New tag color as hex code |

---

#### `manycontacts_tags_delete`

Delete a tag. The tag will be removed from all contacts that have it.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | **Yes** | Tag ID to delete |

---

### Teams

Teams group users together for assignment routing and contact organization.

#### `manycontacts_teams_list`

List all teams in the organization.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters needed |

---

#### `manycontacts_teams_create`

Create a new team.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | **Yes** | Team name |

---

#### `manycontacts_teams_add_member`

Add a user to a team.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `teamId` | `string` | **Yes** | Team ID |
| `userId` | `string` | **Yes** | User ID to add to the team |

---

#### `manycontacts_teams_remove_member`

Remove a user from a team.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `teamId` | `string` | **Yes** | Team ID |
| `userId` | `string` | **Yes** | User ID to remove from the team |

---

#### `manycontacts_teams_delete`

Delete a team. Team members are not deleted, only the team grouping.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | **Yes** | Team ID to delete |

---

### Sales Funnels / Pipelines

Funnels allow you to track contacts through a multi-stage sales or support pipeline (e.g. "New Lead" -> "Qualified" -> "Proposal" -> "Won").

#### `manycontacts_funnels_list`

List all sales funnels/pipelines with their stages.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters needed |

---

#### `manycontacts_funnels_create`

Create a new sales funnel/pipeline.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | **Yes** | Funnel name |

---

#### `manycontacts_funnels_add_stage`

Add a new stage to an existing funnel.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `funnelId` | `string` | **Yes** | Funnel ID |
| `name` | `string` | **Yes** | Stage name (e.g. "Qualified", "Proposal Sent") |
| `order` | `number` | **Yes** | Stage position in the pipeline (0-based) |

---

#### `manycontacts_funnels_update_stage`

Update a stage's name within a funnel.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `funnelId` | `string` | **Yes** | Funnel ID |
| `stageId` | `string` | **Yes** | Stage ID to update |
| `name` | `string` | No | New stage name |

---

#### `manycontacts_funnels_contacts`

List contacts currently in a specific funnel, optionally filtered by stage. Returns paginated results.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `funnelId` | `string` | **Yes** | Funnel ID |
| `stage_id` | `string` | No | Filter by specific stage ID |
| `page` | `number` | No | Page number |
| `limit` | `number` | No | Results per page |

---

#### `manycontacts_funnels_delete`

Delete a sales funnel/pipeline and all its stages. Contacts in the funnel are not deleted.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | **Yes** | Funnel ID to delete |

---

### Users / Team Members

Manage the team members who have access to the WhatsApp Business CRM.

#### `manycontacts_users_list`

List all team members/users in the organization with their roles and details.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters needed |

---

#### `manycontacts_users_get`

Get details of a specific team member.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | **Yes** | User ID |

---

#### `manycontacts_users_update`

Update a team member's profile information.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | **Yes** | User ID to update |
| `name` | `string` | No | New user display name |

---

#### `manycontacts_users_invite`

Invite a new team member to the organization by email. They will receive an invitation email to join.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | `string` | **Yes** | Email address to send the invitation to |

---

#### `manycontacts_users_delete`

Remove a team member from the organization. Their assigned contacts will become unassigned.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | **Yes** | User ID to remove |

---

### AI Agents

AI agents auto-respond to incoming WhatsApp messages using configurable instructions and scenarios. Only active agents are listed.

#### `manycontacts_ai_agents_list`

List all active AI auto-reply agents with their configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | — | — | No parameters needed |

---

#### `manycontacts_ai_agents_get`

Get full details of a specific AI agent including its scenarios (conversation flows), instruction blocks, and configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | **Yes** | AI Agent ID (UUID) |

---

#### `manycontacts_ai_agents_update`

Update an AI agent's configuration. You can enable/disable the agent or modify its instruction blocks.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | **Yes** | AI Agent ID (UUID) |
| `active` | `boolean` | No | Enable (`true`) or disable (`false`) the agent |
| `block_1` | `string` | No | Agent instructions — block 1 |
| `block_2` | `string` | No | Agent instructions — block 2 |
| `block_3` | `string` | No | Agent instructions — block 3 |

---

#### `manycontacts_ai_agents_feedback`

Get feedback and conversation logs for an AI agent. Shows how the agent has been responding and user satisfaction data.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | **Yes** | AI Agent ID (UUID) |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MC_CLI_TOKEN` | Yes* | ManyContacts CLI authentication token. Get one via `mc auth login`. |
| `MC_API_URL` | No | API base URL (default: `https://api.manycontacts.com`) |

> *If you've logged in via the CLI, the token is stored locally at `~/.manycontacts/config.json` and the MCP server reads it automatically.

## Authentication

The MCP server authenticates using CLI tokens. Each token is scoped to an organization and has configurable permissions.

```bash
# Login to get a token
mc auth login --email user@example.com --password mypassword

# The token is stored at ~/.manycontacts/config.json
# Or set it explicitly via environment variable:
export MC_CLI_TOKEN=your-token-here
```

## Rate Limits

- **Paying accounts:** 60 requests/minute
- **Free/trial accounts:** 10 requests/minute

When rate limited, the server returns a `429` error with a link to upgrade.

## License

MIT
