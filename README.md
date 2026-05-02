# Campus Notification System - RA2311030010007

This repository contains the implementation for the Campus Hiring Evaluation.

## Project Overview

The system is a full-stack campus notification dashboard that prioritizes announcements based on their category and recency. It features a mandatory logging integration and a real-time responsive dashboard.

## Structure

- `/logging_middleware`: Core telemetry function used across all components.
- `/priority_inbox`: Stage 1 implementation containing the priority scoring algorithm.
- `/notification_app_fe`: Stage 2 implementation - Next.js responsive dashboard.
- `/notification_app_be`: Node.js/Express backend (local reference implementation).
- `/screenshots`: Visual evidence for Stage 1 and Stage 2 completion.
- `notification_system_design.md`: Comprehensive system architecture and approach documentation.

## Setup and Execution

### Stage 1: Priority Inbox
Navigate to `priority_inbox/` and run:
```bash
npx ts-node --skip-project index.ts
```

### Stage 2: Notification Frontend
Navigate to `notification_app_fe/` and run:
```bash
npm install
npm run dev
```
The dashboard will be available at `http://localhost:3000`.

## Key Features

- **Priority Scoring**: Custom algorithm that weights Placement > Result > Event with recency normalization.
- **Responsive Dashboard**: Dark-mode UI with category filtering and priority toggling.
- **Logging Integration**: Mandatory telemetry tracking for every functional interaction.
- **Secure Proxy**: Server-side API communication to bypass CORS security in the browser.

---
**Candidate ID**: RA2311030010007
