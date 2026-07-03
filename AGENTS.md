# Foundry MCP Patoko

Custom MCP server bridging Foundry VTT to AI assistants via WebSocket. TypeScript monorepo, 66 tools, fully self-hosted.

## Architecture

```
AI Assistant (Hermes) ←stdio→ MCP Server ←WS→ Bridge Server ←WS→ Foundry Module (Browser)
```

Three packages: `mcp-server` (tool definitions + WS client), `foundry-module` (Foundry API calls in browser), `bridge-server` (WS relay). Shared types in `shared/`.

## Build & Run

```bash
npm install && npm run build    # build all workspaces
npm run dev                     # dev mode (MCP server)
npm run dev:mock                # mock mode (no Foundry needed)
```

Individual packages:
```bash
cd packages/shared && npm run build    # must build first
cd packages/mcp-server && npm run build
cd packages/foundry-module && npm run build
```

## Git Workflow

- Branch: `main` (stable)
- CI auto-release on push to `main` via `.github/workflows/release.yml`
- **Release FIRST, deploy SECOND** — CI creates the release, then deploy to sv2
- Commit convention: `type: concise subject` (feat, fix, refactor, docs, chore)
- After every change: `git add -A && git commit -m "..." && git push`

## Deploy (sv2)

```bash
ssh sv2 'cd /opt/foundry-mcp-patoko && git pull && npm install && npm run build && systemctl restart foundry-mcp-bridge'
```

## MCP Tool Testing Protocol

**When testing MCP tools with the Foundry instance:**

1. **Performance awareness**: If a tool call takes noticeably longer than expected (e.g., >5s for a simple query), or returns truncated/incomplete data, or requires multiple retries — do NOT work around it by trying to solve the problem at the Foundry file level or via alternative approaches.

2. **Root cause evaluation**: Assess whether the issue originates in the MCP server layer:
   - Is the WebSocket round-trip slow?
   - Is the tool returning a massive JSON payload that could be optimized?
   - Is there a missing compact/summary mode?
   - Is the Foundry module handler inefficient?

3. **File an issue immediately**: If the root cause is in the MCP server, spawn a subagent to create a GitHub issue describing:
   - Which tool was affected
   - What the symptom was (slow response, truncated data, wrong behavior)
   - Suggested fix or optimization
   - Do NOT stop the current workflow to fix it — just document it

4. **Continue the workflow**: Complete the original task using the best available approach. The issue is for future improvement, not for blocking current work.

**Example**: User asks "search for item X" → search works but returns 300KB JSON → spawn subagent to file issue "search-compendium returns full item data, needs compact mode" → complete the search with the data you have.

## Testing

```bash
bash scripts/test-e2e.sh    # starts mock server, verifies tool discovery
```

Mock mode for development: `MOCK=true node packages/mcp-server/dist/index.js`

## Key Files

| File | Purpose |
|------|---------|
| `packages/mcp-server/src/register-tools.ts` | Tool registration (all 66 tools) |
| `packages/mcp-server/src/foundry-client.ts` | WebSocket client to bridge |
| `packages/foundry-module/src/query-handler.ts` | Foundry API query execution |
| `packages/foundry-module/src/validate-character.ts` | D&D 2024 character validation |
| `packages/bridge-server/src/index.ts` | WebSocket relay server |
| `packages/shared/src/index.ts` | Shared TypeScript types |
