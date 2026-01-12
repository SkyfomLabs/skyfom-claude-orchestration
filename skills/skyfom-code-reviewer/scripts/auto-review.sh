#!/bin/bash
# Automated code review script for PRs
# Usage: ./auto-review.sh <pr-number>

set -euo pipefail

PR_NUMBER=${1:-}

if [ -z "$PR_NUMBER" ]; then
  echo "Usage: $0 <pr-number>"
  exit 1
fi

echo "🔍 Starting automated review for PR #$PR_NUMBER"
echo ""

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Issue counters
P0_COUNT=0
P1_COUNT=0
P2_COUNT=0
P3_COUNT=0

# Checkout PR
echo "📥 Fetching PR..."
gh pr checkout $PR_NUMBER

# Get changed files
CHANGED_FILES=$(gh pr view $PR_NUMBER --json files -q '.files[].path' | tr '\n' ' ')
echo "📝 Changed files: $CHANGED_FILES"
echo ""

# 1. Linting
echo "🔧 Running linter..."
if bun run lint; then
  echo -e "${GREEN}✅ Linting passed${NC}"
else
  echo -e "${YELLOW}⚠️ Lint errors found (P3)${NC}"
  P3_COUNT=$((P3_COUNT + 1))
fi
echo ""

# 2. Type checking
echo "📘 Type checking..."
if bun run type-check; then
  echo -e "${GREEN}✅ Type check passed${NC}"
else
  echo -e "${RED}❌ Type errors found (P1)${NC}"
  P1_COUNT=$((P1_COUNT + 1))
fi
echo ""

# 3. Tests
echo "🧪 Running tests..."
if bun test --coverage; then
  COVERAGE=$(bun test --coverage 2>&1 | grep -oP 'All files.*?\K\d+(?=\.\d+%)' || echo "0")
  if [ "$COVERAGE" -lt 80 ]; then
    echo -e "${YELLOW}⚠️ Coverage below 80% (P2)${NC}"
    P2_COUNT=$((P2_COUNT + 1))
  else
    echo -e "${GREEN}✅ Tests passed with ${COVERAGE}% coverage${NC}"
  fi
else
  echo -e "${RED}❌ Test failures (P1)${NC}"
  P1_COUNT=$((P1_COUNT + 1))
fi
echo ""

# 4. Security scan
echo "🔒 Security scanning..."
if command -v semgrep &> /dev/null; then
  if semgrep --config=auto --json $CHANGED_FILES > /tmp/semgrep-results.json 2>&1; then
    SECURITY_ISSUES=$(jq '.results | length' /tmp/semgrep-results.json)
    if [ "$SECURITY_ISSUES" -gt 0 ]; then
      echo -e "${RED}❌ Found $SECURITY_ISSUES security issue(s) (P0)${NC}"
      P0_COUNT=$SECURITY_ISSUES
      jq -r '.results[] | "  - \(.check_id) in \(.path):\(.start.line)"' /tmp/semgrep-results.json
    else
      echo -e "${GREEN}✅ No security issues found${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️ Semgrep scan failed${NC}"
  fi
else
  echo -e "${YELLOW}⚠️ Semgrep not installed, skipping security scan${NC}"
fi
echo ""

# 5. Bundle size check (frontend only)
if [ -f "vite.config.ts" ] || [ -f "vite.config.js" ]; then
  echo "📦 Checking bundle size..."
  if bun run build; then
    # Check if bundle grew significantly
    echo -e "${GREEN}✅ Build successful${NC}"
    echo "ℹ️  Check bundle size impact manually"
  else
    echo -e "${RED}❌ Build failed (P1)${NC}"
    P1_COUNT=$((P1_COUNT + 1))
  fi
  echo ""
fi

# 6. Check for common issues in changed files
echo "🔎 Checking for common issues..."

for file in $CHANGED_FILES; do
  if [[ $file == *.ts || $file == *.tsx || $file == *.js || $file == *.jsx ]]; then
    # Check for console.log (should be removed in production)
    if grep -q "console\\.log" "$file"; then
      echo -e "${YELLOW}⚠️ Found console.log in $file (P3)${NC}"
      P3_COUNT=$((P3_COUNT + 1))
    fi

    # Check for any type
    if grep -q ": any" "$file"; then
      echo -e "${YELLOW}⚠️ Found 'any' type in $file (P2)${NC}"
      P2_COUNT=$((P2_COUNT + 1))
    fi

    # Check for TODO/FIXME comments
    if grep -q "TODO\|FIXME" "$file"; then
      echo -e "${YELLOW}ℹ️  Found TODO/FIXME in $file${NC}"
    fi

    # Check for hardcoded credentials patterns
    if grep -qE "(password|secret|key|token)\s*=\s*['\"][^'\"]{8,}" "$file"; then
      echo -e "${RED}🚨 Potential hardcoded credential in $file (P0)${NC}"
      P0_COUNT=$((P0_COUNT + 1))
    fi

    # Check for dangerouslySetInnerHTML
    if grep -q "dangerouslySetInnerHTML" "$file"; then
      echo -e "${RED}🚨 Found dangerouslySetInnerHTML in $file (P0 - XSS risk)${NC}"
      P0_COUNT=$((P0_COUNT + 1))
    fi
  fi
done
echo ""

# Summary
echo "================================"
echo "📊 Review Summary"
echo "================================"
echo -e "P0 (Blocker):  ${RED}$P0_COUNT${NC}"
echo -e "P1 (Critical): ${RED}$P1_COUNT${NC}"
echo -e "P2 (Major):    ${YELLOW}$P2_COUNT${NC}"
echo -e "P3 (Minor):    ${YELLOW}$P3_COUNT${NC}"
echo ""

# Determine action
if [ $P0_COUNT -gt 0 ]; then
  echo -e "${RED}❌ BLOCK PR - P0 issues must be fixed${NC}"
  exit 1
elif [ $P1_COUNT -gt 0 ]; then
  echo -e "${YELLOW}⚠️ CHANGES REQUIRED - P1 issues must be fixed${NC}"
  exit 1
elif [ $P2_COUNT -gt 3 ]; then
  echo -e "${YELLOW}💡 RECOMMEND CHANGES - Multiple P2 issues found${NC}"
  exit 0
else
  echo -e "${GREEN}✅ APPROVED - Ready to merge${NC}"
  exit 0
fi
