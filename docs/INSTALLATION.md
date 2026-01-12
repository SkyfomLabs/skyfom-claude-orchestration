# Installation Guide

Complete installation instructions for Skyfom Orchestration Plugin.

## Prerequisites

Before installing, ensure you have:

1. **Claude Code CLI** v2.0.12 or higher
   ```bash
   claude --version
   ```

2. **Beads Issue Tracker**
   ```bash
   bd --version
   ```
   If not installed, install via your preferred method.

3. **GitHub CLI**
   ```bash
   gh --version
   ```
   Install via: `brew install gh` (macOS) or visit https://cli.github.com/

4. **Git**
   ```bash
   git --version
   ```

## Installation Methods

### Method 1: NPM (Recommended)

```bash
npx claude-plugins install @YOUR_USERNAME/skyfom-claude-orchestration
```

**Pros**: Automatic setup, easy updates
**Cons**: Requires internet connection

### Method 2: Claude Code Plugin Command

```bash
# Add marketplace
/plugin marketplace add YOUR_USERNAME/skyfom-claude-orchestration

# Install plugin
/plugin install skyfom-orchestration
```

**Pros**: Native Claude Code integration
**Cons**: Requires marketplace setup

### Method 3: Manual Installation

```bash
# Navigate to your project
cd /path/to/your/project

# Clone repository
git clone https://github.com/YOUR_USERNAME/skyfom-claude-orchestration.git .claude

# Make scripts executable
chmod +x .claude/hooks/scripts/*.sh

# Create state directory
mkdir -p .claude/state
```

**Pros**: Full control, works offline
**Cons**: Manual updates required

### Method 4: Installation Script

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/skyfom-claude-orchestration/main/install.sh | bash
```

**Pros**: Automated setup with verification
**Cons**: Requires trust in remote script

## Verification

After installation, verify:

```bash
# Check plugin is installed
ls -la .claude/

# Verify scripts are executable
ls -l .claude/hooks/scripts/*.sh

# Check state directory
ls -la .claude/state/

# Test Claude Code recognizes plugin
claude
/plugin list
```

You should see `skyfom-orchestration` in the plugin list.

## Configuration

### Initial Configuration

The plugin creates default configuration in `.claude/state/orchestration.json`:

```json
{
  "config": {
    "maxParallelAgents": 7,
    "maxCodeReviewLoops": 50,
    "maxTokensPerAgent": 200000,
    "tokenWarningThreshold": 160000,
    "idealTokensPerAgent": 100000
  }
}
```

### Customization

Edit `.claude/state/orchestration.json` to customize:

```json
{
  "config": {
    "maxParallelAgents": 5,           // Reduce for smaller projects
    "maxCodeReviewLoops": 30,         // Adjust review strictness
    "maxTokensPerAgent": 150000,      // Reduce for cost savings
    "autoRestart": true,               // Auto-continue after completion
    "humanApprovalRequired": false     // Fully autonomous mode
  }
}
```

## Troubleshooting

### Common Issues

**Issue: "Command not found: bd"**
```bash
# Install Beads CLI
npm install -g beads-cli
```

**Issue: "Permission denied" on hooks**
```bash
chmod +x .claude/hooks/scripts/*.sh
```

**Issue: "Plugin not recognized"**
```bash
# Verify plugin.json exists
cat .claude/.claude-plugin/plugin.json

# Restart Claude Code
exit
claude
```

**Issue: ".claude directory already exists"**
```bash
# Backup existing
mv .claude .claude.backup

# Install fresh
# ... follow installation method
```

## Updating

### Via NPM
```bash
npx claude-plugins update @YOUR_USERNAME/skyfom-claude-orchestration
```

### Via Git
```bash
cd .claude
git pull origin main
```

### Manual
```bash
# Backup state
cp -r .claude/state /tmp/state-backup

# Re-clone
rm -rf .claude
git clone https://github.com/YOUR_USERNAME/skyfom-claude-orchestration.git .claude

# Restore state
cp -r /tmp/state-backup/* .claude/state/
```

## Uninstallation

```bash
# Via Claude Code
/plugin uninstall skyfom-orchestration

# Manual
rm -rf .claude
```

## Next Steps

After installation:
1. Read the [User Guide](USER_GUIDE.md)
2. Try a test orchestration
3. Review [Troubleshooting](TROUBLESHOOTING.md) if needed

---

**Need help?** Open an issue on [GitHub](https://github.com/YOUR_USERNAME/skyfom-claude-orchestration/issues)
