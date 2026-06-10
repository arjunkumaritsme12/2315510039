# Stage 1 — Notification API Design

## Overview
The notification management service exposes a REST API for listing, retrieving, creating, updating, deleting, and prioritizing notifications for students.

## Endpoints

### 1. GET /notifications
- Purpose: return paginated notifications for the authenticated user
- Query params: page, limit, notification_type
- Success: 200 OK
- Error: 401 Unauthorized, 400 Bad Request

Example response:
```json
{
  "notifications": [
    {
      "ID": "f7c78282-b4eb-488b-b2b0-f338b578d595",
      "Type": "Placement",
      "Message": "Berkshire Hathaway Inc. hiring",
      "Timestamp": "2026-06-10 06:21:17"
    }
  ]
}
```

### 2. GET /notifications/{id}
- Purpose: fetch one notification by ID
- Success: 200 OK
- Error: 404 Not Found

### 3. POST /notifications
- Purpose: create a new notification
- Request body:
```json
{
  "Type": "Event",
  "Message": "Campus farewell",
  "Timestamp": "2026-06-10 00:20:13"
}
```
- Success: 201 Created
- Error: 400 Bad Request

### 4. PUT /notifications/{id}
- Purpose: update an existing notification
- Success: 200 OK
- Error: 404 Not Found

### 5. DELETE /notifications/{id}
- Purpose: remove a notification from the system
- Success: 204 No Content
- Error: 404 Not Found

### 6. GET /notifications/priority
- Purpose: return the top-priority notifications using the weighting logic
- Success: 200 OK
- Error: 401 Unauthorized

## Error Responses
```json
{
  "error": "invalid authorization token"
}
```

## Status Codes Summary
- 200 OK
- 201 Created
- 204 No Content
- 400 Bad Request
- 401 Unauthorized
- 404 Not Found
- 500 Internal Server Error
