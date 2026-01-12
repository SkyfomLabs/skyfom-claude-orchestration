# Example: P0 Security Issue Review

## PR #456: Add user comment feature

### Issue Found: SQL Injection Vulnerability

**File**: `src/services/comment.service.ts:23`
**Severity**: P0 (BLOCKER)
**Category**: Security

#### Vulnerable Code
```typescript
async function getCommentsByUser(userId: string) {
  const query = `SELECT * FROM comments WHERE user_id = '${userId}'`;
  return await db.execute(query);
}
```

#### Problem
Direct string interpolation in SQL query allows SQL injection attacks.

**Attack Example**:
```typescript
// Attacker input: userId = "1' OR '1'='1"
// Resulting query: SELECT * FROM comments WHERE user_id = '1' OR '1'='1'
// Result: Returns ALL comments from all users
```

#### Fix (Automatic Suggestion)
```typescript
async function getCommentsByUser(userId: string) {
  return await db
    .select()
    .from(comments)
    .where(eq(comments.userId, userId));
}
```

#### Why This Fix Works
- Uses Drizzle ORM's query builder
- Automatically parameterizes the query
- Type-safe at compile time
- Prevents all SQL injection attacks

#### Learn More
- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [Drizzle Query API](https://orm.drizzle.team/docs/select)
- [Parameterized Queries](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

#### Action Taken
- ❌ **Blocked PR** - Must fix before merge
- 🎫 Created ticket: [bd-sec-sql-injection-456](bd://bd-sec-sql-injection-456)
- 🔔 Notified security team
- 📝 Added to security audit log

---

## Review Comment Template

```markdown
## 🚨 P0 Security Issue: SQL Injection

**Location**: src/services/comment.service.ts:23

This code is vulnerable to SQL injection attacks. An attacker could access or modify data from other users.

**Fix**:
\`\`\`typescript
// Use Drizzle's query builder instead
return await db
  .select()
  .from(comments)
  .where(eq(comments.userId, userId));
\`\`\`

**References**:
- OWASP SQL Injection: https://owasp.org/www-community/attacks/SQL_Injection
- Ticket: [bd-sec-sql-injection-456](bd://bd-sec-sql-injection-456)

This is a blocker. Please fix before merge.
```
