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

### Environment variables
Create a `.env` file in `frontend_nextjs/`:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

The frontend reads only this variable and never hard-codes URLs.

## Development

Install dependencies and run the dev server:

```
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Features Implemented

- Sidebar connector cards for Jira and Confluence with live status
- Jira projects grid with real data
- Search bar wired to backend query
- Loading, error, and empty states
- Ocean Professional theme styles
- Full authentication flows:
  - OAuth start for Jira and Confluence via GET /auth/{connector}/oauth/start
  - API Token/Personal Access Token modal for both connectors via POST /auth/{connector}/api-token
  - Automatic status refresh after OAuth callback and after token save

## Backend endpoints used

- Jira
  - GET /auth/jira/status (optional)
  - GET /auth/jira/oauth/start (returns redirect URL or issues HTTP redirect)
  - POST /auth/jira/api-token (expects { token } or { api_token })
  - GET /jira/projects (optional search query param: q)
- Confluence
  - GET /auth/confluence/status (optional)
  - GET /auth/confluence/oauth/start (returns redirect URL or issues HTTP redirect)
  - POST /auth/confluence/api-token (expects { token } or { api_token })
  - GET /confluence/spaces (used for "View" action when connected)

## OAuth callback handling

The backend should perform the OAuth callback and redirect the browser back to the app URL (e.g., http://localhost:3000/) with typical query parameters like `code`/`state`.
On page load, the UI detects these parameters, refreshes connector statuses, optionally reloads Jira projects, and then cleans the URL so refreshes are idempotent.

If your backend uses different query parameters, the current detection is permissive (code/state/oauth_token), but you can extend it in `src/app/page.tsx`.

## Troubleshooting

- Ensure NEXT_PUBLIC_BACKEND_URL points to the running backend.
- If OAuth start doesn't redirect, verify CORS and that GET /auth/{connector}/oauth/start returns either:
  - an immediate HTTP redirect (302), or
  - a JSON `{ "url": "<oauth redirect url>" }`.

If your backend uses different routes, update src/app/page.tsx accordingly.
