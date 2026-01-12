# Skyfom Code Reviewer Skill

Senior code reviewer agent for multi-language code quality, security, and performance analysis.

## Quick Start

### For Developer Agents

When reviewing code, invoke this skill:

```bash
# Skill invocation (for agents)
/skill skyfom-code-reviewer <pr-number>
```

The skill will analyze the PR and generate a structured review with:
- Bug detection (P0-P1)
- Security vulnerabilities (OWASP Top 10)
- Performance issues (N+1, memory leaks)
- Code quality improvements (P2-P3)
- Automatic fix suggestions
- Learning resources

### Manual Review Script

```bash
# Run automated review
./scripts/auto-review.sh <pr-number>
```

## Files Structure

```
skyfom-code-reviewer/
├── SKILL.md                    # Main skill definition
├── README.md                   # This file
├── review-checklist.md         # Complete review checklist
├── examples/
│   ├── review-example-p0.md   # P0: Security issue example
│   ├── review-example-p1.md   # P1: Performance issue example
│   └── review-example-p2.md   # P2: Code quality example
└── scripts/
    └── auto-review.sh          # Automated review script
```

## Review Priorities

| Priority | Type | Action |
|----------|------|--------|
| P0 | Security vulnerability, data loss | **BLOCK PR** immediately |
| P1 | Logic bugs, broken features | **REQUIRE CHANGES** before merge |
| P2 | Code smells, missing tests | **RECOMMEND** fixing |
| P3 | Style, minor improvements | **OPTIONAL** |

## Supported Languages

- **TypeScript/JavaScript** (React, Svelte, Hono, Node.js)
- **Rust** (Actix Web, Diesel)
- **Python** (FastAPI, Django, Flask)
- **Go** (Gin, Echo, GORM)
- **Swift** (SwiftUI, UIKit)
- **Kotlin** (Android, Ktor)
- **SQL** (PostgreSQL, MySQL)

## Review Categories

### 1. Security (P0)
- SQL injection prevention
- XSS vulnerability detection
- Authentication/authorization issues
- Hardcoded credentials
- Data exposure risks

### 2. Bugs (P1)
- Null/undefined handling
- Array bounds checking
- Async error handling
- Race conditions
- Edge case validation

### 3. Performance (P1-P2)
- N+1 query detection
- Database indexing
- Memory leak identification
- Bundle size analysis
- Algorithm efficiency

### 4. Code Quality (P2-P3)
- Complexity analysis
- Naming conventions
- Test coverage
- Code duplication
- Documentation

## Output Format (Token-Efficient)

### Concise Review
```markdown
# PR-<number> Review

**Status**: ❌ Block | P0=1 P1=2 P2=3

## Blockers
- [P0] `file.ts:45` XSS → [bd-xxx](bd://bd-xxx)
- [P1] `service.ts:89` N+1 → [bd-yyy](bd://bd-yyy)

## Suggestions
- Missing tests: feature.ts
- Complex fn: utils.ts:34

**Fix P0-P1 before merge**
```

### JSON Format (Agent-to-Agent)
```json
{
  "pr": 123,
  "status": "BLOCKED",
  "issues": {"p0": 1, "p1": 2, "p2": 3},
  "blockers": [{
    "id": "bd-xxx",
    "file": "file.ts:45",
    "type": "security",
    "fix": "Remove dangerouslySetInnerHTML"
  }]
}
```

## Integration Points

### Beads Issue Tracker
- Creates bug tickets for P0-P1 issues
- Links tickets to PR
- Tracks resolution

### GitHub PR Review
- Approves clean PRs
- Blocks PRs with P0-P1 issues
- Adds review comments with fixes

### Sentry
- Checks for errors in changed files
- Correlates issues with code changes
- Flags error spikes

### CI/CD
- Runs as part of PR checks
- Enforces quality gates
- Blocks merge on failures

## Learning Resources

Each issue includes learning resources:
- OWASP guides for security
- Performance optimization docs
- Refactoring guides
- Testing best practices
- Language-specific resources

## Examples

See `/examples` directory for detailed examples of:
- P0 Security issue (SQL injection)
- P1 Performance issue (N+1 query)
- P2 Code quality issue (complex function)

Each example includes:
- Problem description
- Why it's an issue
- Automatic fix suggestion
- Learning resources
- Beads ticket template

## Usage by Other Skills

### PM Agent Orchestrator
```bash
# PM assigns code review to this skill
bd update <pr-id> --assign skyfom-code-reviewer
```

### Developer Agents
After implementing a feature, developers request review:
```bash
# Backend developer creates PR
gh pr create --title "feat: add user API"

# QA/Code reviewer analyzes
/skill skyfom-code-reviewer <pr-number>
```

## Configuration

The skill uses these tools:
- `gh` - GitHub CLI for PR operations
- `bun` - Runtime for tests and builds
- `semgrep` - Security scanning
- `bd` - Beads issue tracker
- Language-specific linters (ESLint, rustfmt, etc.)

## Token Efficiency

Following `skyfom-tokens-efficiency` guidelines:
- Concise markdown reports
- Beads task links instead of descriptions
- JSON for agent-to-agent communication
- Abbreviations: ✅❌🔄⚠️
- No verbose explanations in chat

## Best Practices

1. **Always run automated checks first** (linting, types, tests)
2. **Prioritize security** - P0 issues block immediately
3. **Suggest fixes** - Don't just identify problems
4. **Include learning resources** - Help developers improve
5. **Create tickets** - Track issues in Beads
6. **Be concise** - Follow token efficiency guidelines

## Maintenance

When updating this skill:
1. Update SKILL.md with new check types
2. Add examples for new issue patterns
3. Update review-checklist.md
4. Test with sample PRs
5. Document new integrations

## Contact

Created for Skyfom development team.
Part of the Skyfom Agent Skills suite.
