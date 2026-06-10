# Stage 6: Priority Inbox

## Setup & Run
```bash
pip install requests
python priority_inbox.py
```

## Output
Displays top 10 notifications ranked by priority score.
Screenshots are in the `screenshots/` folder.

## Algorithm
Priority Score = TypeWeight × e^(−λ × hoursElapsed)

| Type | Weight |
|------|--------|
| Placement | 3 |
| Result | 2 |
| Event | 1 |

Heap-based O(log N) approach for efficient real-time top-N maintenance.
