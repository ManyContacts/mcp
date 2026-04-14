import { z } from "zod";
import type { ServerContext } from "@smithery/sdk";
import { configure } from "./api-client.js";
import { createMcpServer } from "./server.js";

export const configSchema = z.object({
  MC_CLI_TOKEN: z
    .string()
    .describe(
      "ManyContacts CLI authentication token. Get one at https://manycontacts.com or via: npx @manycontacts/cli auth login"
    ),
});

export default function createServer({
  config,
}: ServerContext<z.infer<typeof configSchema>>) {
  configure(config.MC_CLI_TOKEN);
  const server = createMcpServer();
  return server.server;
}
