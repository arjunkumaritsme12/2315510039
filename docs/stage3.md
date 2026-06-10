# Stage 3 — Query Optimization

## Optimized Queries

### Fetch notifications for one user with pagination
```sql
SELECT id, type, message, created_at
FROM notifications
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

### Fetch unread notifications
```sql
SELECT n.id, n.type, n.message, n.created_at
FROM notifications n
LEFT JOIN notification_views v
  ON v.notification_id = n.id AND v.user_id = $1
WHERE v.notification_id IS NULL
ORDER BY n.created_at DESC
LIMIT 50;
```

## Indexing Strategy
- Index on `(user_id, created_at DESC)` for fast lookups and ordering.
- Index on `(notification_id, user_id)` for view tracking.

## Filtering Strategy
- Apply type filters before pagination.
- Limit the result set early to avoid scanning all rows.

## Pagination Strategy
- Use `LIMIT/OFFSET` for small datasets.
- For larger systems, prefer cursor-based pagination using the latest timestamp or ID.

## Complexity and Benefits
- Without an index, lookup cost is roughly $O(n)$.
- With the recommended index, lookup is close to $O(log n + m)$ for the matching set.
- Indexing reduces disk I/O and improves response time under load.
