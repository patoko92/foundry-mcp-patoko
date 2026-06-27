# foundry-mcp-patoko

Custom MCP server for Foundry VTT — built for Patoko infrastructure.

Bridges Hermes Agent (Lucy) to Foundry VTT via WebSocket + MCP protocol.

## Architecture

```
Hermes Agent ←stdio→ MCP Server (hermes-server) ←WebSocket→ Foundry Module (sv2 browser)
```

## Packages

- **`packages/mcp-server`** — MCP Server (Node.js, TypeScript, stdio transport)
- **`packages/foundry-module`** — Foundry VTT module (ES module, client-side)
- **`packages/shared`** — Shared TypeScript types

## Development

```bash
npm install
npm run build
npm run dev
```

## Testing

The MCP server includes a mock mode for testing without a live Foundry session:

```bash
cd packages/mcp-server
npm run dev:mock
```

## License

Private — Patoko Services
