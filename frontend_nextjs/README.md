# OceanConnect Dashboard - Frontend (Next.js)

This is a Next.js (App Router) frontend for the OceanConnect Dashboard. It provides a dashboard UI to connect to Jira and Confluence, view Jira projects, and manage connector states.

## Prerequisites

- Node.js 18+
- A running backend_fastapi service (default at http://localhost:3001)

## Configuration

Set the backend base URL for API calls:

- NEXT_PUBLIC_BACKEND_URL (default: http://localhost:3001)

Create a local environment file:

cp .env.example .env

Adjust the value if your backend runs on a different host/port.

## Development

Install dependencies and run the dev server:

npm install
npm run dev

Open http://localhost:3000 in your browser.

## Features Implemented

- Sidebar connector cards for Jira and Confluence with live status
- Jira projects grid with real data
- Search bar wired to backend query
- Loading, error, and empty states
- Ocean Professional theme styles

## Notes

- Jira status endpoint expected: /auth/jira/status (optional; inferred from projects when unavailable)
- Confluence status endpoint expected: /auth/confluence/status (optional)
- Jira projects endpoint: /jira/projects (supports optional query param: q)
- OAuth flows (placeholders): /auth/jira/oauth/start and /auth/confluence/oauth/start

If your backend uses different routes, update src/app/page.tsx accordingly.
