# Notification System Design

## Stage 1 — REST API Design

### Endpoints

- GET /notifications
  - Returns a paginated list of notifications for the authenticated student.
- GET /notifications/unread
  - Returns unread notifications only.
- POST /notifications
  - Creates a new notification record.
- PATCH /notifications/{id}/read
  - Marks a notification as read.
- DELETE /notifications/{id}
  - Deletes a notification record.

### Headers

- X-Request-ID: unique request id for tracing
- X-API-Key: configurable auth header, set through the environment

### Request Example

```http
GET /notifications HTTP/1.1
Host: api.affordmed.example
X-Request-ID: 8c9d2d8f-8fb4-4bb0-b1f3-533ab4f52e2c
X-API-Key: demo-token
```

### Response Example

```json
{
  "notifications": [
    {
      "ID": "8f1f7b09-6c7f-4d97-a983-58942eba9b5e",
      "Type": "Placement",
      "Message": "Campus placements are live.",
      "Timestamp": "2026-06-10T09:30:00Z",
      "isRead": false
    }
  ]
}
```

### JSON Schema

```json
{
  "type": "object",
  "required": ["ID", "Type", "Message", "Timestamp", "isRead"],
  "properties": {
    "ID": {"type": "string"},
    "Type": {"type": "string", "enum": ["Placement", "Result", "Event"]},
    "Message": {"type": "string"},
    "Timestamp": {"type": "string", "format": "date-time"},
    "isRead": {"type": "boolean"}
  }
}
```

### Real-Time Notification Mechanism

Use WebSocket channels per student topic, with the server pushing a notification event immediately after persistence.

## Stage 2 — Database Design

Recommended database: PostgreSQL.

### Tables

```sql
CREATE TABLE students (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES students(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_read BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE notification_reads (
  id BIGSERIAL PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES notifications(id),
  student_id BIGINT NOT NULL REFERENCES students(id),
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (notification_id, student_id)
);
```

### Indexes

```sql
CREATE INDEX idx_notifications_student_read_created ON notifications(student_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notification_reads_student ON notification_reads(student_id);
```

### Partitioning Strategy

Partition notifications by month for very large datasets.

### Scaling Strategy

- Use read replicas for GET-heavy workloads
- Cache hot notification lists with Redis
- Use queues for bulk dispatch

## Stage 3 — Query Optimization

The query below is slow because it scans the table and sorts all matching rows.

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt DESC;
```

### Why It Is Slow

- Scans many rows
- Requires sorting on the result set
- Causes high I/O cost

### Execution Cost

The cost is dominated by filtering and sort operations. An index on `(student_id, is_read, created_at)` reduces the cost significantly.

### Better Query

```sql
SELECT id, type, message, created_at
FROM notifications
WHERE student_id = 1042
AND is_read = false
ORDER BY created_at DESC
LIMIT 50;
```

### Placement Notifications in Last 7 Days

```sql
SELECT id, message, created_at
FROM notifications
WHERE type = 'Placement'
AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

## Stage 4 — Performance Improvement

### Caching

Use Redis to cache the latest unread notification list per student.

### Pagination

Use cursor pagination for large datasets because it avoids offset scan issues.

### Read Replicas

Use replicas for read-heavy endpoints like unread or recent notifications.

## Stage 5 — Bulk Notification Delivery

### Queue-Based Architecture

- Producer writes job to RabbitMQ or Kafka
- Workers consume and dispatch to email, push, or DB channels
- Use a dead-letter queue for failures

### Retry Strategy

- Exponential backoff with jitter
- Maximum 3 retries

### Idempotency

Use a unique notification key per student and message to prevent duplicate sends.

### Improved Pseudocode

```python
for job in queue:
    if already_processed(job.id):
        continue
    try:
        dispatch(job)
        mark_processed(job.id)
    except Exception:
        retry_with_backoff(job)
```

## Stage 6 — Priority Inbox

The provided script ranks notifications by type and recency using a min-heap to keep the top 10 candidates with $O(N \log K)$ complexity.
