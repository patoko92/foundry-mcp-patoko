import { McpServer } from "@modelcontextprotocol/server";
import { z } from 'zod';
import type { IFoundryClient } from '../types.js';

export function registerChatTools(server: McpServer, client: IFoundryClient): void {
  server.registerTool('send-chat-message', { description: 'Send a message to the Foundry VTT chat. Supports IC, OOC, and emote message types.', inputSchema: z.object({
              content: z.string().describe('Message content to send'),
              speaker: z.string().optional().describe('Speaker name for the message'),
              type: z.enum(['ic', 'ooc', 'emote']).optional().describe('Message type: ic (in-character), ooc (out-of-character), or emote'),
            }) }, async (args) => {
              const content = await client.callMethod('send-chat-message', args);
              return { content };
            });

  server.registerTool('send-whisper', { description: 'Whisper a message to a specific player in Foundry VTT.', inputSchema: z.object({
              content: z.string().describe('Message content to whisper'),
              targetUserId: z.string().describe('User ID to whisper to'),
              speaker: z.string().optional().describe('Speaker name for the whisper'),
            }) }, async (args) => {
              const content = await client.callMethod('send-whisper', args);
              return { content };
            });
}
