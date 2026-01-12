# Example: P1 Performance Issue Review

## PR #457: Display user dashboard with orders

### Issue Found: N+1 Query Problem

**File**: `src/services/dashboard.service.ts:45`
**Severity**: P1 (CRITICAL)
**Category**: Performance

#### Problematic Code
```typescript
async function getDashboardData(userId: string) {
  const user = await db.select().from(users).where(eq(users.id, userId));

  const orders = await db.select().from(orders).where(eq(orders.userId, userId));

  // N+1 problem: Loading products for each order in a loop
  const ordersWithProducts = await Promise.all(
    orders.map(async (order) => ({
      ...order,
      products: await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id)),
    }))
  );

  return { user, orders: ordersWithProducts };
}
```

#### Problem Analysis
- **Queries executed**: 1 (user) + 1 (orders) + N (products for each order)
- **For 100 orders**: 102 database queries
- **Response time**: ~3-5 seconds
- **Database load**: High connection pool usage

#### Performance Impact
```
Test with 100 orders:
- Current: 102 queries, 4.2s response time
- Fixed: 2 queries, 180ms response time
- Improvement: 96% faster
```

#### Fix (Automatic Suggestion)
```typescript
async function getDashboardData(userId: string) {
  // Single query with joins
  const result = await db
    .select({
      // User fields
      userId: users.id,
      userName: users.name,
      userEmail: users.email,

      // Order fields
      orderId: orders.id,
      orderStatus: orders.status,
      orderTotal: orders.total,
      orderDate: orders.createdAt,

      // Product fields
      productId: orderItems.productId,
      productQuantity: orderItems.quantity,
      productPrice: orderItems.price,
    })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(eq(users.id, userId));

  // Transform flat results into nested structure
  return transformToDashboard(result);
}

function transformToDashboard(rows: any[]) {
  const user = {
    id: rows[0]?.userId,
    name: rows[0]?.userName,
    email: rows[0]?.userEmail,
  };

  const ordersMap = new Map();

  rows.forEach(row => {
    if (!row.orderId) return;

    if (!ordersMap.has(row.orderId)) {
      ordersMap.set(row.orderId, {
        id: row.orderId,
        status: row.orderStatus,
        total: row.orderTotal,
        date: row.orderDate,
        products: [],
      });
    }

    if (row.productId) {
      ordersMap.get(row.orderId).products.push({
        id: row.productId,
        quantity: row.productQuantity,
        price: row.productPrice,
      });
    }
  });

  return {
    user,
    orders: Array.from(ordersMap.values()),
  };
}
```

#### Alternative Fix (Batch Query)
```typescript
async function getDashboardData(userId: string) {
  const [user, orders] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)),
    db.select().from(orders).where(eq(orders.userId, userId)),
  ]);

  // Batch load products for all orders (1 query instead of N)
  const orderIds = orders.map(o => o.id);
  const allProducts = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds));

  // Group products by order
  const productsByOrder = new Map();
  allProducts.forEach(product => {
    if (!productsByOrder.has(product.orderId)) {
      productsByOrder.set(product.orderId, []);
    }
    productsByOrder.get(product.orderId).push(product);
  });

  const ordersWithProducts = orders.map(order => ({
    ...order,
    products: productsByOrder.get(order.id) || [],
  }));

  return { user, orders: ordersWithProducts };
}
```

#### Database Index Needed
```sql
-- Add composite index for better performance
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

#### Learn More
- [N+1 Query Problem Explained](https://stackoverflow.com/questions/97197/what-is-the-n1-selects-problem)
- [Drizzle Joins Documentation](https://orm.drizzle.team/docs/joins)
- [SQL Performance Tuning](https://use-the-index-luke.com/)

#### Action Taken
- ⚠️ **Changes Required** - Fix before merge
- 🎫 Created ticket: [bd-perf-n1-dashboard-457](bd://bd-perf-n1-dashboard-457)
- 📊 Added performance benchmark requirement
- 🗄️ Suggested database index

---

## Review Comment Template

```markdown
## ⚠️ P1 Performance Issue: N+1 Query

**Location**: src/services/dashboard.service.ts:45

This code executes 1+N database queries (one per order). For 100 orders, this means 101 queries and ~4s response time.

**Performance Impact**:
- Current: 102 queries, 4.2s
- Fixed: 2-3 queries, 180ms
- 96% improvement

**Fix Option 1** (JOIN - fastest):
\`\`\`typescript
// Single query with LEFT JOIN
const result = await db
  .select({...})
  .from(users)
  .leftJoin(orders, eq(orders.userId, users.id))
  .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
  .where(eq(users.id, userId));
\`\`\`

**Fix Option 2** (Batch - simpler):
\`\`\`typescript
// Load all products in one query
const orderIds = orders.map(o => o.id);
const allProducts = await db
  .select()
  .from(orderItems)
  .where(inArray(orderItems.orderId, orderIds));
\`\`\`

**Also add index**:
\`\`\`sql
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
\`\`\`

**References**:
- N+1 Problem: https://stackoverflow.com/questions/97197/what-is-the-n1-selects-problem
- Ticket: [bd-perf-n1-dashboard-457](bd://bd-perf-n1-dashboard-457)

Please fix before merge. Run performance benchmark after fix.
```
