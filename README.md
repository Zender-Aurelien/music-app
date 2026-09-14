# Music App

A full-stack music search and playlist app built on the [Jamendo](https://www.jamendo.com/) catalog. A Flask JSON API wraps Jamendo's track search and stores user playlists in SQLite, with Google OAuth for sign-in. A React (Vite) frontend lets you search tracks, preview audio, and build/manage playlists.

## Features

- **Track search** — search Jamendo's catalog by name, or browse a default rock-tagged feed.
- **Google sign-in** — OAuth 2.0 login via Google, session-based auth (Flask-Login).
- **Playlists** — create, rename, and delete playlists; add/remove tracks; tracks keep a snapshot of their display info (name, artist, album, art, audio URL, duration) so a playlist stays stable even if Jamendo's data changes later.
- **Client-side shuffle** for playlist playback order.
- Auth-gated UI with empty/error states across the playlist views.

## Project structure

```
jamendo-api/       Flask backend (app factory + blueprints)
  app/
    routes/         auth, playlists, tracks blueprints
    services/       Jamendo API client
    models.py       SQLAlchemy models: User, Playlist, PlaylistTrack
    config.py       env-driven configuration
  wsgi.py           entrypoint (loads .env, creates the app)

music-frontend/     React + Vite frontend
  src/
    pages/          SearchPage, LibraryPage, PlaylistPage
    components/     NavBar, AddToPlaylistMenu
    context/        AuthContext (current user / session state)
    api/            fetch wrappers for auth + playlists endpoints
```

## Backend setup (`jamendo-api/`)

1. Create a virtual environment and install dependencies:
   ```bash
   cd jamendo-api
   python -m venv .venv
   .venv\Scripts\activate      # Windows
   pip install -r requirements.txt
   ```
2. Copy `.env.example` to `.env` and fill in:
   - `CLIENT_ID` — Jamendo API client id ([devportal.jamendo.com](https://devportal.jamendo.com/))
   - `SECRET_KEY` — Flask session signing key (`python -c "import secrets; print(secrets.token_hex(32))"`)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth credentials (Google Cloud Console → APIs & Services → Credentials). Authorized redirect URI must be exactly `http://localhost:5000/api/auth/callback`.
   - `DATABASE_URL` / `FRONTEND_URL` — defaults are fine for local dev.
3. Create the database tables:
   ```bash
   flask --app wsgi init-db
   ```
4. Run the API:
   ```bash
   flask --app wsgi run --debug
   ```
   The API listens on `http://localhost:5000`.

## Frontend setup (`music-frontend/`)

```bash
cd music-frontend
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api` requests to the Flask backend on port 5000.

## API overview

| Route | Method | Description |
|---|---|---|
| `/api/tracks` | GET | Default track feed (fuzzy-tagged) |
| `/api/search?q=` | GET | Search tracks by name |
| `/api/auth/login` | GET | Start Google OAuth flow |
| `/api/auth/callback` | GET | OAuth callback, logs the user in |
| `/api/auth/logout` | POST | Log out (requires auth) |
| `/api/auth/me` | GET | Current session user, or `null` |
| `/api/playlists` | GET, POST | List / create playlists (requires auth) |
| `/api/playlists/<id>` | GET, PATCH, DELETE | Fetch / rename / delete a playlist you own |
| `/api/playlists/<id>/tracks` | POST | Add a track to a playlist |
| `/api/playlists/<id>/tracks/<track_id>` | DELETE | Remove a track from a playlist |

All `/api/playlists` routes require an authenticated session and enforce ownership (403 if the playlist isn't yours). Unauthenticated requests to protected routes get a `401` JSON error rather than an HTML redirect.

## Tech stack

- **Backend:** Flask, Flask-SQLAlchemy (SQLite), Flask-Login, Authlib (Google OAuth), Requests
- **Frontend:** React 19, React Router, Vite

## Branches

- `main` — initial Flask + Jamendo search prototype.
- `feature/playlists-auth` (current) — adds the SQLAlchemy models, Google OAuth login, playlist CRUD API, and the full React frontend (routing, auth context, search/library/playlist pages).
