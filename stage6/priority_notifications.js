const BASE_URL = process.env.NOTIFICATION_API_BASE_URL || 'http://4.224.186.213/evaluation-service';
const ACCESS_TOKEN = process.env.NOTIFICATION_ACCESS_TOKEN || '';

const FALLBACK_NOTIFICATIONS = [
  {
    ID: 'demo-placement-1',
    Type: 'Placement',
    Message: 'Berkshire Hathaway Inc. hiring',
    Timestamp: '2026-06-10 06:21:17',
  },
  {
    ID: 'demo-result-1',
    Type: 'Result',
    Message: 'External result published',
    Timestamp: '2026-06-10 04:50:29',
  },
  {
    ID: 'demo-event-1',
    Type: 'Event',
    Message: 'Campus farewell event',
    Timestamp: '2026-06-10 00:20:13',
  },
];

const TYPE_WEIGHTS = { Placement: 3, Result: 2, Event: 1 };

function parseTimestamp(value) {
  if (!value) return 0;
  const normalized = String(value).replace(' ', 'T');
  const parsed = Date.parse(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getPriorityScore(notification) {
  const weight = TYPE_WEIGHTS[notification?.Type] || 1;
  const timestamp = parseTimestamp(notification?.Timestamp);
  return weight * 1000000000000 + timestamp;
}

class MinHeap {
  constructor(limit = 10) {
    this.limit = limit;
    this.items = [];
  }

  push(entry) {
    this.items.push(entry);
    this._bubbleUp(this.items.length - 1);
    if (this.items.length > this.limit) {
      this.pop();
    }
  }

  pop() {
    if (!this.items.length) return null;
    const first = this.items[0];
    const last = this.items.pop();
    if (this.items.length) {
      this.items[0] = last;
      this._bubbleDown(0);
    }
    return first;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.items[parent].score <= this.items[index].score) break;
      [this.items[parent], this.items[index]] = [this.items[index], this.items[parent]];
      index = parent;
    }
  }

  _bubbleDown(index) {
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      let smallest = index;
      if (left < this.items.length && this.items[left].score < this.items[smallest].score) smallest = left;
      if (right < this.items.length && this.items[right].score < this.items[smallest].score) smallest = right;
      if (smallest === index) break;
      [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
      index = smallest;
    }
  }

  toArray() {
    return this.items.slice().sort((left, right) => right.score - left.score);
  }
}

async function fetchNotifications() {
  try {
    const response = await fetch(`${BASE_URL}/notifications?page=1&limit=50`, {
      headers: {
        Accept: 'application/json',
        ...(ACCESS_TOKEN ? { Authorization: `Bearer ${ACCESS_TOKEN}`, 'X-API-Key': ACCESS_TOKEN } : {}),
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    return payload?.notifications || [];
  } catch (error) {
    console.warn('Falling back to demo notifications:', error.message);
    return FALLBACK_NOTIFICATIONS;
  }
}

async function buildPriorityInbox() {
  const notifications = await fetchNotifications();
  const heap = new MinHeap(10);

  notifications.forEach((notification) => {
    const score = getPriorityScore(notification);
    heap.push({ score, notification });
  });

  const topNotifications = heap.toArray().map((entry) => ({
    ID: entry.notification.ID,
    Type: entry.notification.Type,
    Message: entry.notification.Message,
    Timestamp: entry.notification.Timestamp,
    Score: entry.score,
  }));

  console.table(topNotifications);
  return topNotifications;
}

buildPriorityInbox().catch((error) => {
  console.error('Priority inbox generation failed:', error.message);
  process.exitCode = 1;
});
