# Code Review Checklist

## Critical Checks (Must Review)

### Security (P0)
- [ ] No SQL injection (use parameterized queries)
- [ ] No XSS vulnerabilities (sanitize user input)
- [ ] Auth/authz properly implemented
- [ ] No hardcoded secrets/credentials
- [ ] Sensitive data encrypted/protected
- [ ] CORS configured correctly
- [ ] Rate limiting on public endpoints

### Bugs (P1)
- [ ] Null/undefined checks present
- [ ] Array bounds validated
- [ ] Error handling in async operations
- [ ] No race conditions
- [ ] Edge cases handled
- [ ] Type safety maintained
- [ ] No infinite loops/recursion

### Performance (P1-P2)
- [ ] No N+1 database queries
- [ ] Indexes present for queries
- [ ] No memory leaks
- [ ] Efficient algorithms used
- [ ] Bundle size impact < 10KB
- [ ] Images optimized
- [ ] Lazy loading where appropriate

## Code Quality Checks

### Readability (P2)
- [ ] Clear variable/function names
- [ ] Functions < 50 lines
- [ ] Max nesting depth ≤ 3
- [ ] Cyclomatic complexity < 10
- [ ] No magic numbers
- [ ] Comments for complex logic only

### Architecture (P2)
- [ ] Follows FSD layers (frontend)
- [ ] Single Responsibility Principle
- [ ] DRY - no duplicated code
- [ ] Proper separation of concerns
- [ ] Dependency injection used

### Testing (P2)
- [ ] Unit tests for business logic
- [ ] Edge cases covered
- [ ] Error paths tested
- [ ] No flaky tests
- [ ] Coverage > 80%
- [ ] Integration tests for APIs

### Style (P3)
- [ ] Consistent naming conventions
- [ ] Proper TypeScript types
- [ ] No unused imports/variables
- [ ] Linter passes
- [ ] Formatting consistent

## Language-Specific

### TypeScript/JavaScript
- [ ] Strict mode enabled
- [ ] No `any` types
- [ ] Promises handled properly
- [ ] Event listeners cleaned up
- [ ] Optional chaining used

### Rust
- [ ] No `.unwrap()` in production code
- [ ] Proper error propagation with `?`
- [ ] Lifetimes specified correctly
- [ ] No unnecessary clones
- [ ] Traits used appropriately

### SQL
- [ ] Transactions for multi-step operations
- [ ] Proper indexing strategy
- [ ] No SELECT *
- [ ] Connection pooling configured
- [ ] Migration rollback tested

## Framework-Specific

### React
- [ ] No unnecessary re-renders
- [ ] Keys in lists
- [ ] useEffect dependencies correct
- [ ] Memoization where needed
- [ ] Hooks rules followed

### React Native
- [ ] Platform-specific code handled
- [ ] Performance optimized (FlatList)
- [ ] Accessibility labels present
- [ ] Navigation properly typed

### Hono/Backend
- [ ] Middleware order correct
- [ ] Validation on all inputs
- [ ] Proper status codes
- [ ] CORS configured
- [ ] Error handling middleware

## Documentation

- [ ] README updated if needed
- [ ] API docs updated
- [ ] Breaking changes documented
- [ ] Migration guide if needed
