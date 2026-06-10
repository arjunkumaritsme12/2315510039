# Notification System Design

---

# Stage 1

## REST API Contract for Notification Platform

### Core Actions Identified
The notification platform must support:
1. Fetch all notifications for a logged-in student
2. Fetch unread notifications
3. Mark a notification as read
4. Mark all notifications as read
5. Get notification count (badge)
6. Real-time notification delivery

---

### Endpoints

#### 1. GET /api/notifications
Fetch paginated notifications for the authenticated student.

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
```
?page=1&limit=20&isRead=false&type=Placement
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid-v4",
        "studentId": "student-uuid",
        "type": "Placement",
        "message": "Google is hiring!",
        "isRead": false,
        "createdAt": "2026-04-22T17:51:30Z"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  }
}
```

---

#### 2. GET /api/notifications/:id
Fetch a single notification by ID.

**Headers:**
```json
{ "Authorization": "Bearer <token>" }
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "Result",
    "message": "mid-sem results released",
    "isRead": false,
    "createdAt": "2026-04-22T17:51:30Z"
  }
}
```

**Response (404):**
```json
{ "success": false, "error": "Notification not found" }
```

---

#### 3. PATCH /api/notifications/:id/read
Mark a single notification as read.

**Headers:**
```json
{ "Authorization": "Bearer <token>" }
```

**Response (200):**
```json
{
  "success": true,
  "data": { "id": "uuid", "isRead": true, "updatedAt": "2026-04-22T18:00:00Z" }
}
```

---

#### 4. PATCH /api/notifications/read-all
Mark all notifications as read for the student.

**Headers:**
```json
{ "Authorization": "Bearer <token>" }
```

**Response (200):**
```json
{ "success": true, "data": { "updatedCount": 42 } }
```

---

#### 5. GET /api/notifications/count
Get unread notification count (for badge display).

**Headers:**
```json
{ "Authorization": "Bearer <token>" }
```

**Response (200):**
```json
{ "success": true, "data": { "unreadCount": 7 } }
```

---

### Real-Time Notification Mechanism

**Chosen Approach: WebSockets (Socket.IO)**

WebSockets provide full-duplex communication, making them ideal for real-time notification push without polling.

**Flow:**
1. Frontend connects to `ws://server/notifications` on login
2. Server authenticates via JWT on connection handshake
3. Server emits `new_notification` event when a notification is created
4. Frontend listens and updates UI instantly

**Event Schema:**
```json
{
  "event": "new_notification",
  "data": {
    "id": "uuid",
    "type": "Placement",
    "message": "TCS is hiring",
    "createdAt": "2026-04-22T18:00:00Z"
  }
}
```

---

# Stage 2

## Persistent Storage: Database Choice

**Recommended: PostgreSQL (Relational DB)**

**Reasoning:**
- Notifications have a well-defined, consistent schema (id, studentId, type, message, isRead, timestamps)
- We need complex queries: filter by type, sort by recency, aggregate unread counts
- ACID compliance ensures no notification is lost or double-counted
- Strong indexing support for performance at scale
- Native support for UUIDs, enums, and timestamptz

---

### Database Schema

```sql
-- Students table (referenced by notifications)
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification type enum
CREATE TYPE notification_type AS ENUM ('Event', 'Result', 'Placement');

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Problems at Scale (50K students, 5M notifications)

| Problem | Cause | Solution |
|---------|-------|----------|
| Slow unread queries | Full table scan on 5M rows | Composite index on (student_id, is_read) |
| Table bloat | Old read notifications piling up | Archive/partition old data |
| High write load | All 50K students active simultaneously | Connection pooling (PgBouncer) |
| Slow ORDER BY | No index on created_at | Index on (student_id, created_at DESC) |

---

### SQL Queries Based on Stage 1 APIs

**Fetch paginated notifications for a student:**
```sql
SELECT id, type, message, is_read, created_at
FROM notifications
WHERE student_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

**Unread count:**
```sql
SELECT COUNT(*) as unread_count
FROM notifications
WHERE student_id = $1 AND is_read = false;
```

**Mark single notification as read:**
```sql
UPDATE notifications
SET is_read = true, updated_at = NOW()
WHERE id = $1 AND student_id = $2;
```

**Mark all as read:**
```sql
UPDATE notifications
SET is_read = true, updated_at = NOW()
WHERE student_id = $1 AND is_read = false;
```

---

# Stage 3

## Query Analysis

### The Original Query
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

### Is This Query Accurate?
**Partially.** It correctly fetches unread notifications for a student ordered by time. However:
- `SELECT *` fetches all columns including potentially large `message` TEXT — wasteful
- No `LIMIT` means all 5M rows are scanned and filtered, then sorted — this is the primary performance killer
- No index on `(studentID, isRead)` means a sequential scan of the entire table

### Why Is It Slow?
At 5M notifications and 50K students, without an index:
- PostgreSQL does a full sequential scan (~5M row reads)
- Filters down to student 1042's records
- Sorts in memory (filesort) — O(n log n)
- **Estimated cost: 50,000–200,000 ms** on commodity hardware

---

### What I Would Change

```sql
-- Optimized query
SELECT id, type, message, created_at
FROM notifications
WHERE student_id = $1 AND is_read = false
ORDER BY created_at ASC
LIMIT 50;
```

Changes made:
1. `SELECT *` → select only needed columns
2. Added `LIMIT` to avoid unbounded result sets
3. Use parameterized query ($1) to prevent SQL injection

**Required Index:**
```sql
CREATE INDEX idx_notifications_student_unread
ON notifications (student_id, is_read, created_at ASC);
```

This composite index allows PostgreSQL to use an **Index Scan** instead of Sequential Scan. Estimated cost drops from ~100,000ms to ~5–50ms.

---

### Colleague's Advice: "Index Every Column"

**This advice is NOT effective.** Here's why:

- Every index adds write overhead — each INSERT/UPDATE must update all indexes
- With 50K students and bulk notifications, write throughput drops significantly
- Indexes on low-cardinality columns (like `is_read` which only has 2 values) are not selective — PostgreSQL may ignore them anyway
- Memory usage increases; buffer cache gets polluted with unused index pages

**Correct approach:** Index strategically — only columns used in WHERE, JOIN, and ORDER BY clauses of actual queries.

---

### Query: Students who got a Placement notification in last 7 days

```sql
SELECT DISTINCT student_id
FROM notifications
WHERE type = 'Placement'
  AND created_at >= NOW() - INTERVAL '7 days';
```

**Supporting index:**
```sql
CREATE INDEX idx_notifications_type_created
ON notifications (type, created_at DESC);
```

---

# Stage 4

## Performance Strategy: Notifications on Every Page Load

### Problem
50,000 students, each page load hits the DB → potentially 50,000 simultaneous DB queries → DB overwhelmed.

---

### Suggested Solutions

#### Strategy 1: Server-Side Caching with Redis ✅ (Primary Recommendation)

Cache each student's notification list in Redis with a short TTL.

```
Key:   notifications:student:{studentId}:page:{page}
Value: JSON array of notifications
TTL:   60 seconds
```

**Flow:**
1. Request comes in → Check Redis
2. Cache HIT → Return cached data (< 2ms)
3. Cache MISS → Query PostgreSQL → Store in Redis → Return data

**Tradeoffs:**
- ✅ 90%+ requests never touch the DB
- ✅ Sub-millisecond read latency
- ❌ Data can be slightly stale (up to TTL seconds)
- ❌ Cache invalidation complexity — must invalidate when new notification arrives or is marked read

**Cache Invalidation:**
```js
// On new notification created or read status changed:
await redis.del(`notifications:student:${studentId}:page:*`);
```

---

#### Strategy 2: HTTP Response Caching (Cache-Control headers)

```
Cache-Control: private, max-age=30
ETag: "abc123hash"
```

- Browser caches response for 30s
- On re-request, server checks ETag — if unchanged, returns 304 Not Modified
- ✅ Zero server load for repeat page loads within 30s
- ❌ Only works if user doesn't get new notifications frequently

---

#### Strategy 3: Pagination + Lazy Loading

Instead of loading all notifications, load only 20 at a time, load more on scroll.

- ✅ Dramatically reduces payload size per request
- ✅ Works well with Redis cache per page
- ❌ Doesn't reduce DB hits, only reduces data transferred

---

#### Strategy 4: WebSocket Push (Avoid Polling Entirely)

Instead of fetching on every page load, maintain a persistent WebSocket connection. Server pushes updates only when new notifications arrive.

- ✅ Eliminates page-load DB hits almost entirely
- ✅ True real-time experience
- ❌ Requires WebSocket infrastructure
- ❌ Connection overhead for 50K concurrent users needs horizontal scaling

---

### Recommended Combined Approach

1. **Redis cache** for initial page load (TTL 60s)
2. **WebSocket** for real-time new notification push → invalidates cache
3. **Pagination** (limit 20) to keep payloads small

---

# Stage 5

## Bulk Notification System Redesign

### Observed Shortcomings in Original Implementation

```
function notify_all(student_ids: array, message: string):
    for student_id in student_ids:
        send_email(student_id, message)   # Synchronous - blocks
        save_to_db(student_id, message)   # Synchronous - blocks  
        push_to_app(student_id, message)  # Synchronous - blocks
```

**Problems:**
1. **Synchronous loop** over 50,000 students — takes hours, blocks server thread
2. **No atomicity** — if `send_email` fails midway (as it did at student 200), `save_to_db` and `push_to_app` may have partially executed — data inconsistency
3. **No retry mechanism** — failed emails are lost forever
4. **Email + DB in same transaction scope** — Email is a side effect and cannot be rolled back; DB can be
5. **No rate limiting** — Email API will throttle/fail bulk requests
6. **Single point of failure** — one error crashes the entire loop

---

### What Happened at Student 200?

The `send_email` call failed (network timeout, email API rate limit, etc.). Since there's no error handling, the loop likely threw an exception and stopped. Students 200–50,000 received nothing. No retries were attempted.

---

### Should DB save and Email happen together?

**No.** They should be decoupled:
- DB save is transactional and fast — do it immediately
- Email is an external side effect, slow, and failure-prone — do it asynchronously via a queue
- If email fails, you can retry without re-saving to DB

---

### Redesigned Architecture

**Use a Message Queue (e.g., Redis Queue / BullMQ / RabbitMQ)**

```
HR clicks "Notify All"
        ↓
[API] Save all 50K notifications to DB in bulk INSERT
        ↓
[API] Enqueue 50K jobs to Message Queue (fast, non-blocking)
        ↓
[Workers] Multiple worker processes consume queue
        ├── Worker picks job → send_email → mark job done
        ├── Worker picks job → push_to_app → mark job done
        └── On failure → retry up to 3 times with backoff
```

---

### Revised Pseudocode

```python
function notify_all(student_ids: array, message: string):
    # Step 1: Bulk insert all notifications to DB atomically
    notifications = []
    for student_id in student_ids:
        notifications.append({
            student_id: student_id,
            message: message,
            type: "Placement",
            is_read: false,
            created_at: now()
        })
    db.bulk_insert("notifications", notifications)  # Single transaction
    
    # Step 2: Enqueue email jobs (non-blocking)
    for student_id in student_ids:
        email_queue.enqueue({
            job_id: uuid(),
            student_id: student_id,
            message: message,
            retry_count: 0,
            max_retries: 3
        })
    
    return { success: true, queued: len(student_ids) }


# Worker process (runs separately, multiple instances)
function email_worker():
    while true:
        job = email_queue.dequeue()
        if job is None:
            sleep(100ms)
            continue
        
        try:
            send_email(job.student_id, job.message)
            push_to_app(job.student_id, job.message)
            job.mark_complete()
        except EmailException as e:
            if job.retry_count < job.max_retries:
                job.retry_count += 1
                email_queue.enqueue_with_delay(job, delay=2^job.retry_count * seconds)
                log.warn(f"Email failed for {job.student_id}, retry {job.retry_count}")
            else:
                log.error(f"Email permanently failed for {job.student_id}: {e}")
                dead_letter_queue.push(job)  # Manual review later
```

---

### Key Improvements

| Issue | Fix |
|-------|-----|
| Synchronous blocking | Async queue-based workers |
| No error handling | Try/catch + retry with exponential backoff |
| Email + DB coupled | DB saved immediately; email is async side effect |
| No visibility into failures | Dead letter queue + structured logging |
| 50K sequential sends | Multiple parallel workers consuming queue concurrently |

---

# Stage 6

## Priority Inbox Implementation

See `priority-inbox/priority_inbox.py` for working code.

### Approach

Priority is determined by a **weighted scoring system** combining:
1. **Type weight:** Placement = 3, Result = 2, Event = 1
2. **Recency score:** Notifications decay in importance over time using exponential decay

**Formula:**
```
priority_score = type_weight * recency_factor
recency_factor = e^(-λ * hours_since_created)  where λ = 0.1
```

This ensures a recent Event can outrank a much older Placement notification.

### Maintaining Top-N Efficiently with New Notifications

Use a **Min-Heap of size N**:
- Maintain a heap with the top N highest-scored notifications
- When a new notification arrives, calculate its score
- If score > heap minimum → pop minimum → push new notification
- Time complexity: O(log N) per new notification vs O(n log n) for full re-sort

```python
import heapq

def maintain_top_n(heap, new_notification, n):
    score = calculate_priority(new_notification)
    if len(heap) < n:
        heapq.heappush(heap, (score, new_notification))
    elif score > heap[0][0]:
        heapq.heapreplace(heap, (score, new_notification))
```

