#!/usr/bin/env bash
# test-e2e.sh — End-to-end test for foundry-mcp-patoko with mock server
#
# Starts the mock Foundry server, then sends an MCP tools/list request
# to the MCP server via stdio and verifies it returns tools.
#
# Usage: ./scripts/test-e2e.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

MOCK_SERVER_DIR="$PROJECT_ROOT/packages/mock-server"
MCP_SERVER_DIR="$PROJECT_ROOT/packages/mcp-server"

MOCK_PORT=31415
MOCK_PID=""
RESULT="FAIL"

cleanup() {
  if [[ -n "$MOCK_PID" ]]; then
    kill "$MOCK_PID" 2>/dev/null || true
    wait "$MOCK_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "=== E2E Test: foundry-mcp-patoko ==="
echo ""

# 1. Start mock server
echo "[1/4] Starting mock server on port $MOCK_PORT..."
cd "$MOCK_SERVER_DIR"
PORT=$MOCK_PORT node dist/index.js &
MOCK_PID=$!
echo "  Mock server PID: $MOCK_PID"

# 2. Wait for mock server to be ready
echo "[2/4] Waiting for mock server to start..."
sleep 2

# Verify mock server is running
if ! kill -0 "$MOCK_PID" 2>/dev/null; then
  echo "  FAIL: Mock server failed to start"
  exit 1
fi
echo "  Mock server is running."

# 3. Send tools/list request to MCP server
echo "[3/4] Sending tools/list request to MCP server..."
cd "$MCP_SERVER_DIR"

# Build a JSON-RPC tools/list request for the MCP stdio protocol
# The MCP SDK expects JSON-RPC messages on stdin
TOOLS_REQUEST='{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test-client","version":"0.1.0"}}}'

# Send initialize + initialized + tools/list and capture output
MCP_OUTPUT=$(echo -e "$TOOLS_REQUEST\n{\"jsonrpc\":\"2.0\",\"method\":\"notifications/initialized\"}\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"tools/list\"}" | timeout 15 node dist/index.js 2>/dev/null) || true

echo "  MCP server responded."

# 4. Check if we got tools back
echo "[4/4] Verifying response..."
if echo "$MCP_OUTPUT" | grep -q '"tools"'; then
  echo "  Found 'tools' in response."
  RESULT="PASS"
else
  echo "  Response did not contain tools."
  echo "  Raw output (first 500 chars):"
  echo "$MCP_OUTPUT" | head -c 500
  echo ""
fi

echo ""
echo "=== Result: $RESULT ==="
[[ "$RESULT" == "PASS" ]]
