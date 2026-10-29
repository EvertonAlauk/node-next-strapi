const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;
const STRAPI = process.env.STRAPI_URL;

// Items per page: PAGE_SIZE in api/.env (default 5). Clients may ask for another size, up to MAX_PAGE_SIZE.
const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(process.env.PAGE_SIZE, 10) || 5));

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Generic call to Strapi. Uses the server API token unless a user JWT is passed.
async function strapi(path, options = {}, token = process.env.STRAPI_TOKEN) {
  const res = await fetch(`${STRAPI}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const body = res.status === 204 ? null : await res.json();
  return { status: res.status, body };
}

// Only logged-in users get through. The JWT is checked by asking Strapi who it belongs to.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  try {
    const { status, body } = await strapi('/users/me', {}, token);
    if (status !== 200) return res.status(401).json({ error: 'Session expired. Please log in again.' });
    req.user = body;
    next();
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Could not reach Strapi.', detail: err.message });
  }
}

// LOGIN - exchanges username/email + password for a JWT
app.post('/auth/login', route(async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/username and password are required.' });
  }

  const { status, body } = await strapi('/auth/local', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
  if (status !== 200) return res.status(401).json({ error: 'Invalid credentials.' });

  res.json({ jwt: body.jwt, user: body.user });
}));

// REGISTER - creates a users-permissions user in Strapi and logs them in
app.post('/auth/register', route(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password are required.' });
  }

  const { status, body } = await strapi('/auth/local/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
  if (status !== 200) {
    // Strapi explains the problem (taken email/username, password too short, ...)
    return res.status(400).json({ error: body?.error?.message || 'Could not create the account.' });
  }

  res.status(201).json({ jwt: body.jwt, user: body.user });
}));

// ME - current user for a given JWT
app.get('/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Wraps each route: network/Strapi errors become a JSON response instead of a crash
function route(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error(err);
      res.status(502).json({ error: 'Could not reach Strapi.', detail: err.message });
    }
  };
}

function validate(req, res, next) {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'The "title" field is required.' });
  }
  next();
}

// READ - list
// ?search=... matches posts whose title, author or content contains the text (case-insensitive)
// Keep this list in sync with SEARCH_FIELDS in frontend/lib/filters.ts
const SEARCH_FIELDS = ['title', 'author', 'content'];

app.get('/posts', requireAuth, route(async (req, res) => {
  const params = new URLSearchParams({ sort: 'createdAt:desc' });

  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
  if (search) {
    // Strapi $or: one condition per field, any of them may match
    SEARCH_FIELDS.forEach((field, index) => {
      params.set(`filters[$or][${index}][${field}][$containsi]`, search);
    });
  }

  // ?mine=1 keeps only the posts written by the logged-in user (the username comes from the token)
  if (req.query.mine === '1') params.set('filters[author][$eq]', req.user.username);

  // Pagination: ?page=1&pageSize=... (DEFAULT_PAGE_SIZE unless asked otherwise). Strapi returns meta.pagination.
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.pageSize, 10) || DEFAULT_PAGE_SIZE));
  params.set('pagination[page]', page);
  params.set('pagination[pageSize]', pageSize);

  const { status, body } = await strapi(`/posts?${params}`);
  res.status(status).json(body);
}));

// READ - detail
app.get('/posts/:id', requireAuth, route(async (req, res) => {
  const { status, body } = await strapi(`/posts/${req.params.id}`);
  res.status(status).json(body);
}));

// Fields clients may write. The author is never taken from the request.
const WRITABLE_FIELDS = ['title', 'content'];
function pickWritable(body) {
  return Object.fromEntries(WRITABLE_FIELDS.filter((field) => field in body).map((field) => [field, body[field]]));
}

// Only the author of a post may change or delete it. Sends the response itself and returns false on refusal.
async function checkOwner(req, res) {
  const { status, body } = await strapi(`/posts/${req.params.id}`);
  if (status === 404) {
    res.status(404).json({ error: 'Post not found.' });
    return false;
  }
  if (status !== 200) {
    res.status(status).json(body);
    return false;
  }
  if (body.data.author !== req.user.username) {
    res.status(403).json({ error: 'You can only change your own posts.' });
    return false;
  }
  return true;
}

// CREATE - the author is always the logged-in user
app.post('/posts', requireAuth, validate, route(async (req, res) => {
  const data = { ...pickWritable(req.body), author: req.user.username };
  const { status, body } = await strapi('/posts', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
  if (status >= 400) {
    return res.status(status).json({ error: body?.error?.message ?? '' });
  }
  res.status(status).json(body);
}));

// UPDATE - the author stays as it was
app.put('/posts/:id', requireAuth, validate, route(async (req, res) => {
  if (!(await checkOwner(req, res))) return;
  const { status, body } = await strapi(`/posts/${req.params.id}`, {
    method: 'PUT',
    body: JSON.stringify({ data: pickWritable(req.body) }),
  });
  if (status >= 400) {
    return res.status(status).json({ error: body?.error?.message ?? '' });
  }
  res.status(status).json(body);
}));

// DELETE
app.delete('/posts/:id', requireAuth, route(async (req, res) => {
  if (!(await checkOwner(req, res))) return;
  const { status, body } = await strapi(`/posts/${req.params.id}`, {
    method: 'DELETE',
  });
  res.status(status).json(body ?? { ok: true });
}));

app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));