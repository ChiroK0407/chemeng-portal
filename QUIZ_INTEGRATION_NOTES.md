# Quiz feature — integration notes

Everything here follows Option A: quiz attempts work for both logged-in
members (via `attachUserIfPresent`, populating `req.userId`) and anonymous
guests (via a `guest_name` fallback). Switch to members-only later by
changing `attachUserIfPresent` to `requireUserSession` in
`server/src/routes/quiz.routes.ts` — no schema or controller change needed.

## New files (safe to copy in as-is)

- `server/db/migration_003_quizzes.sql`
- `server/src/controllers/quiz.controller.ts`
- `server/src/routes/quiz.routes.ts`
- `src/types/quiz.types.ts`
- `src/services/quiz.service.ts`
- `src/pages/admin/AdminQuizzes.tsx`
- `src/pages/admin/panels/QuizzesPanel.tsx`
- `src/pages/quizzes/QuizListPage.tsx`
- `src/pages/quizzes/QuizAttemptPage.tsx`

## Files from your Google OAuth batch, included here unmodified

`server/db/auth_schema.sql`, `server/db/auth_schema_google_migration.sql`,
`server/src/services/userAuth.service.ts`, `server/src/services/googleAuth.service.ts`,
`server/src/middleware/userAuth.middleware.ts`, `server/src/controllers/userAuth.controller.ts`,
`server/src/routes/userAuth.routes.ts`, `server/package.json`, `server/.env.example`,
`src/context/AuthContext.tsx`, `src/components/auth/GoogleSignInButton.tsx`,
`src/pages/auth/LoginPage.tsx`, `src/pages/auth/SignupPage.tsx`.

## One file changed: `server/src/index.ts`

Your uploaded version already mounts `psuRoutes`, `eventRoutes`, `resourceRoutes`.
I added two lines on top of that — nothing else touched:

```ts
import quizRoutes from './routes/quiz.routes';   // added, alongside the other route imports
...
app.use('/api/quizzes', quizRoutes);             // added, alongside the other app.use(...) mounts
```

## `src/routes/index.tsx` — now included, updated

You supplied your current copy of this file, so it's included here with
three additions on top of your existing structure, nothing else touched:

- `QuizListPage` and `QuizAttemptPage` lazy imports, plus two new routes
  under the existing `PublicLayout` children (`/quizzes`,
  `/quizzes/:quizId/attempt`) — no `RequireAuth` wrapper, since attempt-taking
  itself already works for both members and guests under Option A
- `AdminQuizzes` lazy import, plus `/admin/quizzes`, following the same
  unguarded-route-plus-internal-password-gate pattern as `/admin`

## Run order for the SQL migrations

1. `server/db/auth_schema.sql` (fresh DB) **or**
   `server/db/auth_schema_google_migration.sql` (DB already has a `users` table)
2. `server/db/migration_003_quizzes.sql` — depends on `users(id)` existing

## Known gap, unchanged from earlier discussion

With `attachUserIfPresent`, anyone — logged in or not — can start a quiz
attempt under a typed `guest_name` and land on the leaderboard. The server
enforces the per-question time limit itself, but not identity. This is
expected under Option A and closes automatically once you switch to
`requireUserSession`.
