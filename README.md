<div align="center">

# 🔥 Foundry MCP Patoko

**A custom MCP (Model Context Protocol) server bridging Foundry VTT to AI assistants via WebSocket.**

51 tools · TypeScript · Fully self-hosted · Zero cloud dependencies

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Foundry: v13+](https://img.shields.io/badge/Foundry%20VTT-v13%2B-orange.svg)](https://foundryvtt.com/)
[![Tools: 51](https://img.shields.io/badge/Tools-51-green.svg)](#tools)

</div>

---

## What Is This?

Foundry MCP Patoko connects [Foundry VTT](https://foundryvtt.com/) to any MCP-compatible AI assistant (like [Hermes Agent](https://hermes-agent.nousresearch.com/)) via the [Model Context Protocol](https://modelcontextprotocol.io/). It enables natural language interaction with your tabletop campaign — read characters, manage combat, roll dice, create journals, and more.

### Key Features

- **51 MCP tools** covering actors, scenes, combat, tokens, compendium, journals, macros, active effects, folders, rollable tables, and chat
- **Fully self-hosted** — no cloud relay, no external accounts required
- **Bridge architecture** — runs a local WebSocket relay; no server-side Foundry modules needed
- **Mock mode** for development and testing without a live Foundry session
- **Auto-reconnect** with exponential backoff on connection drops
- **GM permission checks** — write operations require GM access

---

## Architecture

```
┌──────────────────┐      stdio       ┌──────────────┐      WebSocket      ┌───────────────┐      WebSocket      ┌────────────────┐
│  AI Assistant    │ ◄──────────────► │  MCP Server  │ ◄─────────────────► │ Bridge Server │ ◄─────────────────► │ Foundry Module │
│  (Hermes, etc.)  │                  │  (Node.js)   │                     │  (Node.js)    │                     │  (Browser/ESM) │
└──────────────────┘                  └──────────────┘                     └───────────────┘                     └────────────────┘
                                              │                                    │                                    │
                                         hermes-server                       hermes-server                           sv2 (browser)
                                        (MCP stdio)                        (WS 0.0.0.0:31415)                    (Foundry VTT)
```

### Components

| Component | Process | Port | Location | Description |
|-----------|---------|------|----------|-------------|
| **MCP Server** | Spawned by Hermes (stdio) | — | hermes-server | Translates MCP protocol ↔ WebSocket queries |
| **Bridge Server** | systemd service | `0.0.0.0:31415` | hermes-server | Routes messages between MCP server and Foundry module |
| **Foundry Module** | Runs in GM browser | — | sv2 (Foundry VTT) | Executes Foundry API calls, returns results |

---

## Quick Start

### Prerequisites

- **Foundry VTT** v13+ running (v14 verified)
- **Node.js** 18+ on the machine running the MCP/Bridge server
- **AI Assistant** that supports MCP (e.g., Hermes Agent, Claude Desktop, Cursor)

### 1. Install the Foundry Module

In Foundry VTT → **Game Settings** → **Install Module** → paste this manifest URL:

```
https://raw.githubusercontent.com/patoko92/foundry-mcp-patoko/main/packages/foundry-module/module.json
```

Click **Install**, then **Enable** the module in **Manage Modules**.

### 2. Configure Module Settings

In Foundry → **Game Settings** → **Module Settings** → **Foundry MCP Patoko**:

| Setting | Default | Description |
|---------|---------|-------------|
| MCP Server Host | `100.91.31.34` | IP/hostname of the machine running the Bridge Server |
| MCP Server Port | `31415` | WebSocket port |
| MCP Namespace | `/foundry-mcp` | WebSocket path (do not change) |
| Auto Connect | ✅ | Connect on Foundry startup |
| Log Level | `info` | Debug verbosity |

### 3. Deploy the Bridge Server

```bash
# Clone the repo
git clone https://github.com/patoko92/foundry-mcp-patoko.git
cd foundry-mcp-patoko

# Install dependencies and build
npm install
npm run build

# Create systemd service
cat > /etc/systemd/system/foundry-mcp-bridge.service << 'EOF'
[Unit]
Description=Foundry MCP Bridge Server
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/node /opt/foundry-mcp-patoko/packages/bridge-server/dist/index.js
WorkingDirectory=/opt/foundry-mcp-patoko/packages/bridge-server
Restart=on-failure
RestartSec=5
Environment=PORT=31415
Environment=LOG_LEVEL=info

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now foundry-mcp-bridge
```

Verify: `curl http://localhost:31415/health`

### 4. Register the MCP Server with Hermes

```bash
hermes mcp add foundry-patoko \
  --command node \
  --arg "/opt/foundry-mcp-patoko/packages/mcp-server/dist/index.js"
```

Then **fix the env config** (hermes mcp add has a known bug with `--env`):

```python
python3 -c "
import yaml
with open('/root/.hermes/config.yaml') as f: cfg = yaml.safe_load(f)
cfg['mcp_servers']['foundry-patoko'] = {
    'command': 'node',
    'args': ['/opt/foundry-mcp-patoko/packages/mcp-server/dist/index.js'],
    'env': {
        'WS_HOST': '127.0.0.1',
        'WS_PORT': '31415',
        'WS_NAMESPACE': '/foundry-mcp'
    },
    'enabled': True
}
with open('/root/.hermes/config.yaml', 'w') as f: yaml.dump(cfg, f, default_flow_style=False, sort_keys=False)
"
```

Restart Hermes: `hermes restart`

### 5. Connect

1. Open Foundry VTT as a **GM** in your browser
2. The module auto-connects to the Bridge Server
3. Your AI assistant now has access to all 51 tools

---

## Tools

### World Information

| Tool | Description |
|------|-------------|
| `get-world-info` | Get world name, system, version, connected users |

### Actors

| Tool | Description |
|------|-------------|
| `list-actors` | List all actors (filterable by type: character/npc/vehicle) |
| `get-actor` | Get detailed actor data by name or ID |
| `create-actor` | Create a new actor (character, npc, vehicle) |
| `update-actor` | Update an actor's data fields |
| `get-actor-items` | Get all items on an actor (filterable by item type) |
| `get-actor-spells` | Get actor's spells with spell slot info |
| `update-actor-hp` | Modify HP (damage, heal, or set) |
| `add-item-to-actor` | Add an item from compendium or inline data |
| `remove-item-from-actor` | Remove an item from an actor |

### Scenes

| Tool | Description |
|------|-------------|
| `list-scenes` | List all scenes with token counts |
| `get-current-scene` | Get the active scene with all tokens |
| `switch-scene` | Activate a different scene |

### Tokens

| Tool | Description |
|------|-------------|
| `list-tokens` | List all tokens on a scene |
| `get-token-details` | Get detailed token info (position, actor, etc.) |
| `move-token` | Move a token to new x/y coordinates |
| `update-token` | Update token properties (img, name, visibility, etc.) |
| `delete-tokens` | Delete one or more tokens |
| `toggle-token-condition` | Add/remove conditions (blinded, charmed, frightened, etc.) |

### Combat

| Tool | Description |
|------|-------------|
| `get-combat-state` | Get current combat (round, turn, combatants, initiative) |
| `roll-initiative` | Roll initiative for a specific combatant |
| `start-combat` | Create and start a new combat encounter |
| `end-combat` | End the current combat |
| `next-turn` | Advance to the next turn |
| `previous-turn` | Go back to the previous turn |
| `add-combatant` | Add a token/actor to combat |
| `remove-combatant` | Remove a combatant |
| `roll-all-initiative` | Roll initiative for all combatants |
| `set-initiative` | Set a combatant's initiative manually |

### Compendium

| Tool | Description |
|------|-------------|
| `search-compendium` | Search across compendium packs |
| `get-compendium-item` | Get a specific item from a pack |
| `list-compendium-packs` | List all available packs |

### Dice

| Tool | Description |
|------|-------------|
| `roll-dice` | Roll dice using standard notation (e.g., `2d20+5`) |

### Journals

| Tool | Description |
|------|-------------|
| `list-journals` | List all journal entries |
| `search-journals` | Search journals by text query |
| `create-journal` | Create a new journal entry with HTML content |

### Chat

| Tool | Description |
|------|-------------|
| `send-chat-message` | Send a message to Foundry chat (IC, OOC, or emote) |
| `send-whisper` | Send a private whisper to a specific player |

### Ownership

| Tool | Description |
|------|-------------|
| `assign-actor-ownership` | Grant a player ownership of an actor |
| `remove-actor-ownership` | Revoke a player's ownership |
| `list-actor-ownership` | Show who has access to an actor |

### Macros

| Tool | Description |
|------|-------------|
| `list-macros` | List all available macros |
| `execute-macro` | Execute a macro by name or ID |

### Active Effects

| Tool | Description |
|------|-------------|
| `list-actor-effects` | List active effects on an actor |
| `add-effect-to-actor` | Apply an active effect (e.g., buffs, debuffs) |
| `remove-effect-from-actor` | Remove an active effect |

### Folders

| Tool | Description |
|------|-------------|
| `list-folders` | List folders by type (Actor, Item, Scene, etc.) |
| `create-folder` | Create a new folder |

### Rollable Tables

| Tool | Description |
|------|-------------|
| `list-roll-tables` | List all rollable tables |
| `roll-table` | Roll on a table and return results |

### Scene Notes

| Tool | Description |
|------|-------------|
| `get-scene-notes` | Get journal entries pinned to a scene |

---

## Packages

```
foundry-mcp-patoko/
├── packages/
│   ├── mcp-server/          # MCP Server (stdio transport)
│   │   └── src/tools/       # 18 tool files, 51 tools
│   ├── foundry-module/      # Foundry VTT client module
│   │   └── src/             # Query handlers, WS client, settings
│   ├── bridge-server/       # WebSocket relay server
│   ├── shared/              # Shared TypeScript types
│   └── mock-server/         # Mock Foundry server for dev/testing
├── scripts/
│   └── test-e2e.sh          # End-to-end test script
└── README.md
```

---

## Development

### Build All Packages

```bash
npm install
npm run build
```

### Build Individual Packages

```bash
# Shared types (must build first)
cd packages/shared && npm run build

# MCP Server
cd packages/mcp-server && npm run build

# Foundry Module
cd packages/foundry-module && npm run build

# Bridge Server
cd packages/bridge-server && npm run build

# Mock Server
cd packages/mock-server && npm run build
```

### Mock Mode (No Foundry Required)

Test the MCP server without a live Foundry session:

```bash
cd packages/mcp-server
MOCK=true node dist/index.js
```

### End-to-End Test

```bash
bash scripts/test-e2e.sh
```

This starts the mock server, connects the MCP server via WebSocket, and verifies tool discovery.

---

## Environment Variables

### MCP Server

| Variable | Default | Description |
|----------|---------|-------------|
| `WS_HOST` | `127.0.0.1` | Bridge Server hostname |
| `WS_PORT` | `31415` | Bridge Server port |
| `WS_NAMESPACE` | `/foundry-mcp` | WebSocket path |
| `MOCK` | `false` | Use mock client instead of WebSocket |

### Bridge Server

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `31415` | Listening port |
| `LOG_LEVEL` | `info` | Log verbosity (debug/info/warn/error) |

---

## Troubleshooting

### Foundry module shows "MCP bridge disconnected"

1. Check Bridge Server is running: `systemctl status foundry-mcp-bridge`
2. Check health: `curl http://localhost:31415/health`
3. Verify `foundryConnected: true` in health response
4. Ensure Foundry module settings point to the correct Bridge Server IP

### MCP server returns "Foundry module not connected"

1. Open Foundry VTT as a **GM** in your browser
2. The module only connects when a GM session is active
3. Check Bridge logs: `journalctl -u foundry-mcp-bridge -f`

### Module settings not showing in Foundry

This was a known bug in v0.1.1 (fixed in v0.1.2). Ensure you are on v0.2.0+.

### Hermes doesn't see the tools

Restart Hermes after adding the MCP server: `hermes restart`

---

## Compatibility

- **Foundry VTT**: v13+ (verified on v14.363)
- **Game Systems**: D&D 5e, Pathfinder 2e, and system-agnostic tools
- **Node.js**: v18+
- **Hermes Agent**: Built-in MCP client support

---

## Credits

Built for the [Patoko](https://github.com/patoko92) infrastructure.

Inspired by [adambdooley/foundry-vtt-mcp](https://github.com/adambdooley/foundry-vtt-mcp) — redesigned with a bridge architecture for reliability and self-hosted deployment.

---

## License

MIT
