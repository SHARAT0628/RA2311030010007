# Notification System Design

## Overview

This document describes the architecture of the Notification App — a real-time, full-stack notification delivery system. It supports creating, reading, and managing notifications for users with multi-channel delivery (in-app and API-based).

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                           │
│                     Next.js + TypeScript (Frontend)                 │
│                                                                     │
│  ┌──────────────┐   ┌──────────────┐   ┌───────────────────────┐   │
│  │  Pages       │   │  Components  │   │  Hooks / State Mgmt   │   │
│  │  /           │   │  Notification│   │  useNotifications()   │   │
│  │  /dashboard  │   │  List        │   │  useAuth()            │   │
│  └──────┬───────┘   └──────┬───────┘   └──────────┬────────────┘   │
│         └──────────────────┴───────────────────────┘               │
│                             │ HTTP / REST                           │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────────┐
│                         API LAYER (Backend)                         │
│                   Node.js + Express + TypeScript                    │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     Route Definitions                         │  │
│  │  POST   /api/notifications        → Create notification       │  │
│  │  GET    /api/notifications        → Fetch all notifications   │  │
│  │  GET    /api/notifications/:id    → Fetch single notification  │  │
│  │  PATCH  /api/notifications/:id    → Mark as read              │  │
│  │  DELETE /api/notifications/:id    → Delete notification       │  │
│  └───────────────────┬───────────────────────────────────────────┘  │
│                      │                                              │
│  ┌───────────────────▼───────────────────────────────────────────┐  │
│  │                   Service Layer                                │  │
│  │  NotificationService                                          │  │
│  │  - createNotification(payload)                                │  │
│  │  - getAllNotifications(userId)                                 │  │
│  │  - markAsRead(id)                                             │  │
│  │  - deleteNotification(id)                                     │  │
│  └───────────────────┬───────────────────────────────────────────┘  │
│                      │                                              │
│  ┌───────────────────▼───────────────────────────────────────────┐  │
│  │               Repository / Data Access Layer                   │  │
│  │  NotificationRepository                                       │  │
│  │  - In-memory store (for demo) / MongoDB-ready interface       │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              Logging Middleware (Cross-cutting)                │  │
│  │  Log(stack, level, package, message)                          │  │
│  │  → Posts structured logs to Evaluation Server                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### Frontend (`notification_app_fe`)

| Layer       | Technology              | Responsibility                                 |
|-------------|-------------------------|------------------------------------------------|
| Framework   | Next.js 14 (App Router) | SSR/SSG, routing, API calls                    |
| Language    | TypeScript              | Type safety across components and hooks        |
| Styling     | Vanilla CSS (Modules)   | Responsive, scoped, component-level styles     |
| State       | React useState/useEffect| Client-side notification state management      |
| API Client  | Fetch API               | HTTP calls to backend REST endpoints           |
| Logging     | logger.ts middleware    | Sends frontend logs to evaluation server       |

#### Key Pages & Components

- **`/` (Home)** — Landing page with a call-to-action to open dashboard
- **`/dashboard`** — Main notification dashboard
  - `NotificationList` — Renders all notifications, supports mark as read / delete
  - `NotificationCard` — Single notification item with status, title, timestamp
  - `NotificationForm` — Form to create a new notification

---

### Backend (`notification_app_be`)

| Layer        | Technology           | Responsibility                                |
|--------------|----------------------|-----------------------------------------------|
| Framework    | Node.js + Express    | HTTP server and routing                       |
| Language     | TypeScript           | Type-safe controllers, services, repositories |
| Storage      | In-memory (Map)      | Simple demo data store (MongoDB-ready)        |
| Logging      | logger.ts middleware | Sends backend logs to evaluation server       |

#### Endpoint Design

| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| POST   | `/api/notifications`        | Create a new notification          |
| GET    | `/api/notifications`        | Retrieve all notifications         |
| GET    | `/api/notifications/:id`    | Retrieve a notification by ID      |
| PATCH  | `/api/notifications/:id`    | Mark a notification as read        |
| DELETE | `/api/notifications/:id`    | Delete a notification by ID        |

---

### Logging Middleware (`logging_middleware`)

The `Log(stack, level, pkg, message)` function is a shared cross-cutting utility:

- **Stack**: `"frontend"` or `"backend"`
- **Level**: `"debug"` | `"info"` | `"warn"` | `"error"` | `"fatal"`
- **Package**: Matches the evaluation spec's allowed package names
- **Delivery**: POSTs to `http://20.207.122.201/evaluation-service/logs` with a Bearer token
- **Failure Strategy**: Silent — logs never crash the host application

---

## Data Flow

```
User Action (Frontend)
        │
        ▼
Next.js Page/Component
        │
        ▼
API Call (fetch → backend /api/notifications)
        │
        ├─── Log("frontend", "info", "api", "Fetching notifications...")
        │
        ▼
Express Route Handler
        │
        ├─── Log("backend", "info", "route", "GET /api/notifications received")
        │
        ▼
NotificationService
        │
        ├─── Log("backend", "debug", "service", "Processing notification list")
        │
        ▼
NotificationRepository (in-memory / DB)
        │
        ▼
Response → Frontend → UI Update
```

---

## Key Design Decisions

1. **In-Memory Storage**: Used for simplicity and zero-dependency demo. The repository interface is abstracted so it can be swapped with MongoDB or PostgreSQL without changing the service layer.

2. **Separation of Concerns**: Strict layering (Route → Controller → Service → Repository) ensures the system is testable and maintainable.

3. **Shared Logging Middleware**: A single `Log()` function is used across both frontend and backend, sending structured telemetry to the evaluation server for observability.

4. **TypeScript Throughout**: Full type safety for notification payloads, HTTP responses, and log parameters reduces runtime errors.

5. **Vanilla CSS Modules**: Scoped styles prevent class conflicts and keep the bundle small without external CSS frameworks.

---

## Scalability Considerations

- **Database**: Replace in-memory store with MongoDB Atlas or PostgreSQL for production.
- **Auth**: Add JWT-based authentication middleware for user-scoped notifications.
- **Real-time**: Integrate WebSockets or Server-Sent Events (SSE) for live notification push.
- **Queue**: Use a message queue (e.g., BullMQ, RabbitMQ) for high-volume notification delivery.

---

# Stage 1

## Priority Inbox

Users receive a high volume of campus notifications daily. To help them focus on what matters most, the Priority Inbox surfaces the top N most important unread notifications using a scoring algorithm that combines notification type weight and recency.

## Scoring Formula

Each notification receives a priority score:

```
priorityScore = typeWeight + recencyScore
```

**Type Weights:**
| Type | Weight |
|---|---|
| Placement | 3 |
| Result | 2 |
| Event | 1 |

**Recency Score:**
Normalized between 0 and 1 using min-max normalization across all fetched notifications:

```
recencyScore = (timestamp - minTimestamp) / (maxTimestamp - minTimestamp)
```

The newest notification gets a recency score of 1, the oldest gets 0.

**Score Ranges:**
- Placement: 3.0 → 4.0
- Result: 2.0 → 3.0
- Event: 1.0 → 2.0

A very recent Result can outrank an old Placement, making this a genuine weighted combination of both factors rather than a strict type hierarchy.

## Approach

1. Fetch all notifications from the evaluation API
2. Compute min and max timestamps across the full list
3. Score each notification using the formula above
4. Sort descending by score
5. Return the top N results (default: 10)

## Efficiency Consideration

Notifications keep arriving continuously. For large datasets, sorting all N items each time is O(N log N). A more efficient approach is to maintain a **min-heap of size K** (the desired top count), processing each incoming notification in O(log K) time. This gives O(N log K) overall, which is significantly faster when K << N.

For this implementation, since N is fetched in one API call, sort is used. In a streaming/real-time scenario, the heap approach would be applied.

## Sample Output

```
============================
  Top 10 Priority Notifications
============================

#    Type         Score    Message                             Timestamp
--------------------------------------------------------------------------------
1    Placement    3.9560   Microsoft Corporation hiring        2026-05-02 04:00:39
2    Placement    3.6956   Meta Platforms Inc. hiring          2026-05-01 22:01:03
3    Placement    3.6734   Advanced Micro Devices Inc. hiring  2026-05-01 21:30:27
4    Placement    3.6527   Advanced Micro Devices Inc. hiring  2026-05-01 21:01:51
5    Placement    3.1961   Marriott International Inc. hiring  2026-05-01 10:31:27
6    Placement    3.0878   Amgen Inc. hiring                   2026-05-01 08:01:57
7    Result       3.0000   mid-sem                             2026-05-02 05:01:21
8    Placement    3.0000   Broadcom Inc. hiring                2026-05-01 06:00:45
9    Result       2.9997   internal                            2026-05-02 05:00:57
10   Result       2.9785   mid-sem                             2026-05-02 04:31:39
```
