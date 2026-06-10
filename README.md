# AffordMed Campus Hiring Evaluation - Full Stack

**Candidate Name:** Arjun Kumar
**Roll Number:** 2315510039

---

## Project Overview

This repository contains the complete submission for the AffordMed Campus Hiring Evaluation. The project covers system design, backend architecture, notification prioritization, structured logging, and a frontend application for displaying notifications.

The solution is organized according to the evaluation stages and follows a modular, production-oriented structure.

---

## Repository Structure

```text
2315510039/
├── notification_system_design.md
├── README.md
│
├── backend/
│   └── src/
│       ├── middleware/
│       │   ├── logger.js
│       │   └── auth.js
│       ├── routes/
│       │   └── notifications.js
│       ├── controllers/
│       │   └── notificationController.js
│       ├── services/
│       │   └── notificationService.js
│       ├── config/
│       │   └── db.js
│       ├── utils/
│       │   └── helpers.js
│       ├── app.js
│       └── server.js
│
├── priority-inbox/
│   ├── priority_inbox.py
│   ├── screenshots/
│   └── README.md
│
└── frontend/
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── components/
        │   ├── AllNotifications/
        │   ├── PriorityInbox/
        │   └── common/
        ├── pages/
        ├── hooks/
        │   └── useNotifications.js
        ├── services/
        │   └── api.js
        └── utils/
            └── prioritySort.js
```

---

## Evaluation Stages

| Stage   | Category             | Deliverable                   |
| ------- | -------------------- | ----------------------------- |
| Stage 1 | System Design        | REST API Contract             |
| Stage 2 | Database Design      | Database Schema & SQL Queries |
| Stage 3 | Performance Analysis | Query Optimization & Indexing |
| Stage 4 | System Design        | Caching Strategy              |
| Stage 5 | System Design        | Bulk Notification Redesign    |
| Stage 6 | Implementation       | Priority Inbox Algorithm      |
| Stage 7 | Frontend Development | React Notification Dashboard  |

All Stage 1–5 responses are included in:

```text
notification_system_design.md
```

---

## Key Features

### Backend

* Modular backend architecture
* Logging middleware integration
* Authentication middleware support
* Notification service layer
* Structured request and error handling

### Priority Inbox (Stage 6)

* Fetches notifications from evaluation API

* Calculates priority scores using:

  Priority Score = Type Weight × Recency Factor

* Type Weights:

  * Placement = 3
  * Result = 2
  * Event = 1

* Uses Min Heap for efficient Top-N ranking

* Optimized complexity:

  * Time: O(N log K)
  * Space: O(K)

### Frontend (Stage 7)

* React-based user interface
* Displays all notifications
* Displays priority-ranked inbox
* Responsive component structure
* API integration for notification retrieval

---

## Technology Stack

### Backend

* Node.js
* Express.js
* JavaScript

### Priority Inbox

* Python 3
* Requests
* Heapq
* Logging

### Frontend

* React
* Vite
* JavaScript
* CSS

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd 2315510039
```

---

## Running Stage 6 - Priority Inbox

```bash
cd priority-inbox

pip install requests

python priority_inbox.py
```

Output:

* Fetches notifications from API
* Calculates priority scores
* Displays Top-N notifications
* Stores logs in log files

---

## Running Stage 7 - Frontend

```bash
cd frontend

npm install

npm run dev
```

Application runs at:

```text
http://localhost:3000
```

---

## Logging

The project includes structured logging support as required by the evaluation guidelines.

Features:

* Request logging
* Error logging
* Execution tracing
* Debug support
* File-based log storage

---

## Screenshots

Output screenshots for Stage 6 are available in:

```text
priority-inbox/screenshots/
```

---

## Notes

* Authentication can be configured using environment variables.
* API endpoints are configurable.
* Structured logging is implemented throughout the solution.
* Stages 1–5 are design-based and documented in a single markdown file.
* Stage 6 and Stage 7 contain executable implementations.

---

## Author

Arjun Kumar

Roll Number: 2315510039

AffordMed Campus Hiring Evaluation Submission
