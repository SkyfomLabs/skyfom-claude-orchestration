#!/bin/bash
set -e

echo "🚀 Installing Skyfom Orchestration Plugin for Claude Code..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .claude directory exists
if [ -d ".claude" ]; then
  echo -e "${YELLOW}Warning: .claude directory already exists${NC}"
  read -p "Do you want to overwrite it? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 1
  fi
  echo "Backing up existing .claude to .claude.backup..."
  mv .claude .claude.backup
fi

# Clone the plugin
echo "📦 Downloading plugin..."
git clone https://github.com/YOUR_USERNAME/skyfom-claude-orchestration.git .claude

# Make scripts executable
echo "🔧 Setting up permissions..."
chmod +x .claude/hooks/scripts/*.sh 2>/dev/null || true

# Create state directory
echo "📁 Creating state directory..."
mkdir -p .claude/state

# Initialize orchestration state
cat > .claude/state/orchestration.json <<'STATE'
{
  "version": "1.0.0",
  "startedAt": null,
  "phase": "idle",
  "status": "idle",
  "config": {
    "maxParallelAgents": 7,
    "maxCodeReviewLoops": 50,
    "maxTokensPerAgent": 200000,
    "tokenWarningThreshold": 160000,
    "idealTokensPerAgent": 100000,
    "autoRestart": false,
    "humanApprovalRequired": true
  },
  "agents": [],
  "tasks": [],
  "metrics": {
    "totalTokensUsed": 0,
    "averageTokensPerTask": 0,
    "tokensPerAgent": {}
  }
}
STATE

echo ""
echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo "📚 Quick Start:"
echo "  1. Ensure you have required dependencies:"
echo "     - Claude Code CLI v2.0.12+"
echo "     - Beads CLI (bd command)"
echo "     - GitHub CLI (gh command)"
echo ""
echo "  2. Start orchestration:"
echo "     claude"
echo "     /skyfom-orchestrate <epic-id>"
echo ""
echo "  3. View documentation:"
echo "     cat .claude/README.md"
echo ""
echo "🌟 Happy orchestrating!"
