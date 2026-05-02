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
