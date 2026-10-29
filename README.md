# Posts App

A small blog-style app: users register, log in, and write posts. Everyone logged in can read the posts, search and filter them, and edit or delete only the posts they wrote.

## Stack

| Part | Technology | Folder | Port |
| --- | --- | --- | --- |
| Backend / CMS | [Strapi 5](https://strapi.io) with SQLite | `backend/` | 1337 |
| API (proxy) | Node.js + Express 5 | `api/` | 4000 |
| Frontend | Next.js 16 (App Router) + React 19 + Tailwind CSS 4 | `frontend/` | 3000 |

The browser only talks to the Next.js app. The Next.js server calls the API, and the API calls Strapi. The API keeps the Strapi token, and the user's login token lives in an httpOnly cookie, so neither reaches the browser's JavaScript.

```
Browser ──► Next.js (3000) ──► API (4000) ──► Strapi (1337) ──► SQLite
              server actions        checks login and owner        posts, users
              and server pages      adds the author
```

## Requirements

- **Node.js 20 to 26** (the backend `engines` field allows that range)
- **npm**
- Windows, macOS or Linux

## Project structure

```
posts-app/
├── backend/                 Strapi CMS (content type "post", users, admin panel)
│   ├── config/              Strapi configuration (database, plugins, server)
│   ├── database/migrations/ Database migrations (e.g. unique post title)
│   └── src/api/post/        Post content type, routes, controllers, services
├── api/                     Express API that sits between the frontend and Strapi
│   └── server.js            Routes for posts and auth, login checks, owner checks
└── frontend/                Next.js app
    ├── app/                 Pages: home, login, register, posts/new, posts/[id], posts/[id]/edit
    ├── components/          Navbar, post table, filters, pagination, dialogs, forms
    ├── lib/                 API client, session helpers, filters, pagination, redirects
    └── proxy.ts             Sends visitors without a session to /login
```

## Setup

Run these steps once, in this order.

### 1. Install the dependencies

```bash
cd backend && npm install
cd ../api && npm install
cd ../frontend && npm install
```

### 2. Configure the backend (Strapi)

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and replace every `tobemodified` value with a random string. You can generate them with:

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

`APP_KEYS` takes a comma-separated list of two or more of these values.

### 3. Configure the API

```bash
cd ../api
cp .env.example .env
```

Fill in `STRAPI_TOKEN` (see step 5). The other values work as they are.

### 4. Configure the frontend

```bash
cd ../frontend
cp .env.example .env.local
```

The default `NEXT_PUBLIC_API_URL=http://localhost:4000` works unless you change the API port.

### 5. Start Strapi and create the admin user

```bash
cd backend
npm run develop
```

Open <http://localhost:1337/admin>, create the first admin account, then:

1. Go to **Settings → API Tokens → Create new API token**. Choose **Full access** (or give it `find`, `findOne`, `create`, `update` and `delete` on the Post content type). Copy the token. Strapi shows it only once.
2. Paste it into `api/.env` as `STRAPI_TOKEN=...`.
3. Check **Settings → Users & Permissions → Advanced settings → Allow new registrations** is on, if you want people to sign up from the app.

Posts and users are stored in `backend/.tmp/data.db` (SQLite). No database server is needed.

## Running the project

Each part runs in its own terminal. Start them in this order:

```bash
# Terminal 1: Strapi
cd backend
npm run develop          # http://localhost:1337  (admin at /admin)

# Terminal 2: API
cd api
npm start                # http://localhost:4000

# Terminal 3: frontend
cd frontend
npm run dev              # http://localhost:3000
```

Open <http://localhost:3000>. You will be sent to the login page. Click **Register**, create an account, and start posting.

The API and the frontend read their `.env` files only when they start. After changing a `.env` value, stop the process (Ctrl+C) and start it again.

### Production build

```bash
cd frontend
npm run build
npm start                # serves the built app on port 3000
```

## Features

- **Accounts:** register with username, email and password; log in with email or username; log out. Registration logs the new user in and goes to the home page. The login page returns you to the page you tried to open.
- **Protected pages:** every page needs a login. A visitor without a session goes to `/login?redirect_to=<page>`, and comes back there after logging in.
- **Posts:** create, view, edit and delete. The author is always the logged-in user and cannot be changed.
- **Ownership:** only the author can edit or delete a post. Other posts show no Edit or Delete option, and their edit page shows "not found".
- **Unique titles:** two posts cannot have the same title. The check is in the database (unique index), and the API turns that error into the message *"A post with this title already exists"*.
- **Search:** one search box looks in title, author and content, ignoring case.
- **Only my posts:** a checkbox that shows only the logged-in user's posts.
- **Pagination:** page size comes from `PAGE_SIZE` (default 5). The page bar shows the current page, 3 pages on each side, and the first and last pages.
- **Post actions:** a three-dot menu on each of your posts with Edit and Delete. Delete asks for confirmation first.

## Environment variables

| File | Variable | Default | What it does |
| --- | --- | --- | --- |
| `backend/.env` | `HOST`, `PORT` | `0.0.0.0`, `1337` | Where Strapi listens |
| `backend/.env` | `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY` | none | Strapi secrets. Use random values. |
| `backend/.env` | `DATABASE_CLIENT`, `DATABASE_FILENAME` | `sqlite`, `.tmp/data.db` | Database. SQLite is the default. |
| `api/.env` | `PORT` | `4000` | Port of the API |
| `api/.env` | `STRAPI_URL` | `http://localhost:1337` | Where Strapi is |
| `api/.env` | `STRAPI_TOKEN` | none | Strapi API token (required) |
| `api/.env` | `PAGE_SIZE` | `5` | Posts per page (the API caps requests at 50) |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | URL of the API |

Never commit the `.env` files. The `.gitignore` already excludes them.

## API reference

All post routes need a logged-in user: send `Authorization: Bearer <jwt>`. The frontend does this for you.

| Method | Route | Body / query | Notes |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | `{ username, email, password }` | Returns `{ jwt, user }`. Fails with 400 and a message if the email or username is taken. |
| `POST` | `/auth/login` | `{ identifier, password }` | Returns `{ jwt, user }`. `identifier` is the email or username. |
| `GET` | `/auth/me` | | Returns the user for the token |
| `GET` | `/posts` | `search`, `mine=1`, `page`, `pageSize` | Newest first, paginated. Returns `data` and `meta.pagination`. |
| `GET` | `/posts/:documentId` | | One post |
| `POST` | `/posts` | `{ title, content }` | The author is set from the token. Returns 409 if the title is taken. |
| `PUT` | `/posts/:documentId` | `{ title, content }` | Only the author. Returns 403 otherwise, 409 for a taken title. |
| `DELETE` | `/posts/:documentId` | | Only the author. Returns 204. |

## Frontend routes

| Route | Who | What |
| --- | --- | --- |
| `/login` | everyone | Log in (with a link to register) |
| `/register` | everyone | Create an account |
| `/` | logged in | Posts list, search, "only my posts", pagination |
| `/posts/new` | logged in | Create a post |
| `/posts/[id]` | logged in | Read a post |
| `/posts/[id]/edit` | author only | Edit a post |

## Troubleshooting

- **`/api/posts` returns 404 in Strapi, or the frontend says it cannot reach the API:** check that Strapi is running on 1337 and that the API is running on 4000.
- **A change in `.env` or in the API does not take effect:** restart that process. Only the Strapi dev server reloads its own code.
- **Posts list says "Could not load posts":** the API is down, or `STRAPI_TOKEN` is missing or wrong.
- **Sent to `/login` again after logging in:** the session token expired or the API was restarted with a different `JWT_SECRET` in Strapi. Log in again.
- **Hydration warning about `fdprocessedid` in the console:** a browser extension (usually a password manager) is changing the HTML. It does not affect the app. Disable the extension for `localhost` to remove the warning.
- **Strapi starts with a database error about the title:** the unique index needs no duplicate titles. Rename or remove the duplicates, then restart Strapi.

## Notes for development

- The frontend uses Next.js 16 with `cacheComponents`. Data that depends on the user is read inside `<Suspense>`, and pages export `instant = false`. See `frontend/AGENTS.md`.
- Session cookie: `jwt`, httpOnly, valid for 7 days. Strapi issues JWTs that last 30 days (`jwtManagement: 'legacy-support'`).
- Post authorship is stored as the author's username in the `author` field. Usernames are unique, so this identifies the owner.
