import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import projectRoutes from './routes/project.routes';
import blogRoutes from './routes/blog.routes';
import opportunityRoutes from './routes/opportunity.routes';
import memberRoutes from './routes/member.routes';
import notificationRoutes from './routes/notification.routes';
import adminAuthRoutes from './routes/adminAuth.routes';

import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ── Global security & parsing ──
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'http://localhost:5173',
    credentials: true, // required so the admin_session cookie is sent/received
  })
);
app.use(express.json());
app.use(cookieParser());

// ── Rate limiting ──
// General limit is generous — this protects against abuse/scraping, not
// normal browsing. A handful of team members clicking around (with React
// Query refetching, dev-mode double-renders, etc.) can easily hit 100
// requests in 15 minutes without doing anything wrong.
// The login route gets its own tight limit since it's the one endpoint
// that's guessable (a password) rather than gated by a secret token —
// that's the one worth actually rate-limiting hard.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again in 15 minutes.', code: 'TOO_MANY_REQUESTS' },
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.', code: 'TOO_MANY_LOGIN_ATTEMPTS' },
});
app.use('/api/', apiLimiter);
app.use('/api/admin/login', loginLimiter);

app.get('/api/health', (_req, res) => res.status(200).json({ success: true, message: 'ok' }));

// ── Routes ──
// Public-facing content. Deferred for a later stage: psus, events/RSVP,
// resources, full user accounts — see server/db/schema.sql notes.
app.use('/api/blogs', blogRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminAuthRoutes);

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}`, code: 'ROUTE_NOT_FOUND' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
