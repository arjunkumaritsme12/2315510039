# AffordMed Campus Hiring Evaluation - Full Stack
**Candidate Roll No:** 2315510039

## Repository Structure

```
2315510039/
├── notification_system_design.md   ← Stage 1-6 responses (all in one file)
├── README.md
│
├── backend/                        ← (Reference only - Stages 1-5 are design/theory)
│   └── src/
│       ├── middleware/
│       │   ├── logger.js           ← Logging Middleware (Pre-Test Setup)
│       │   └── auth.js
│       ├── routes/notifications.js
│       ├── controllers/notificationController.js
│       ├── services/notificationService.js
│       ├── config/db.js
│       ├── utils/helpers.js
│       ├── app.js
│       └── server.js
│
├── priority-inbox/                 ← Stage 6: Working Python code
│   ├── priority_inbox.py           ← Main implementation
│   ├── screenshots/                ← Output screenshots
│   └── README.md
│
└── frontend/                       ← Stage 7: React app (localhost:3000)
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── components/
        │   ├── AllNotifications/
        │   ├── PriorityInbox/
        │   └── common/
        ├── pages/
        ├── hooks/useNotifications.js
        ├── services/api.js         ← Calls http://4.224.186.213/evaluation-service/notifications
        └── utils/prioritySort.js
```

## Stages Summary

| Stage | Type | Deliverable |
|-------|------|-------------|
| 1 | Design | REST API Contract in `notification_system_design.md` |
| 2 | Design | DB Schema + SQL queries (same md file) |
| 3 | Analysis | Query optimization + indexing advice (same md file) |
| 4 | Design | Caching strategy (same md file) |
| 5 | Design | Bulk notification redesign + pseudocode (same md file) |
| 6 | Code | `priority-inbox/priority_inbox.py` + screenshots |
| 7 | Code | `frontend/` React app on localhost:3000 |

## How to Run

### Stage 6 - Priority Inbox
```bash
cd priority-inbox
pip install requests
python priority_inbox.py
```

### Stage 7 - Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000
```
