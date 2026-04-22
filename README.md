# ScholarSync

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

- Node.js 18 or newer
- npm (or yarn/pnpm/bun)
- Git installed

## Dependency Installation

Before running or building the project, install all dependencies:

```bash
npm install
```

> **Note:** This project uses several runtime dependencies (UI, state, utility, and theme libraries) that must be present for the app to build and run. If you see errors about missing modules (e.g., `lucide-react`, `clsx`, `zustand`, etc.), ensure you have run `npm install`.

## Prisma Version Alignment

**Important:** The versions of `prisma` (CLI/dev) and `@prisma/client` (runtime) must match. This project uses:

- `prisma@6.19.2`
- `@prisma/client@6.19.2`

If you upgrade one, upgrade the other to the same version to avoid runtime errors.

## Build Troubleshooting

If you encounter build errors about missing modules, run:

```bash
npm install
```

If you see errors about Prisma engine files or version mismatches, ensure both `prisma` and `@prisma/client` are the same version in `package.json`.

## Development

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Scripts

- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm run start` — Start the production server
- `npm run lint` — Lint the codebase
- `npm run format` — Format the codebase with Prettier
- `npm run seed` — Seed the database (see `prisma/seed.ts`)

## Database

Prisma schema is in `prisma/schema.prisma`. To apply migrations or seed data, use the provided npm scripts.

### Local DB + Auth Quick Setup

If login fails locally, ensure your database schema is applied and seed users have passwords:

```bash
npx prisma db push
npm run seed
```

After seeding, you can sign in with:

- `sampleprojecte@gmail.com` (password: `samssena#21321`)
- `ashaperera@gmail.com` (password: `asha#123`)
- `kamal@student.sliit.lk` (password: `Password@123`)
- `sams@student.sliit.lk` (password: `Password@123`)
- `sarah@lecturer.sliit.lk` (password: `Password@123`)

Default password for legacy seed users:

- `Password@123`

Also ensure local env vars are set:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL=http://localhost:3000`

If `npm run seed` fails with "Can't reach database server", your `DATABASE_URL` is not reachable from your machine.

Quick checks:

- Verify the host/port in `DATABASE_URL` is correct and publicly reachable.
- If using a hosted DB (e.g., Supabase), ensure the project is running and network access is allowed.
- If using local Postgres, ensure the service is started before running `npx prisma db push` and `npm run seed`.

## License

See [LICENSE](LICENSE).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Auth Environment Variables (Vercel + CD)

For NextAuth login/session to work after deployment, configure these environment variables in Vercel Project Settings:

- `NEXTAUTH_URL=https://scholar-sync-jet.vercel.app/`
- `NEXTAUTH_SECRET=<your-strong-random-secret>`
- `DATABASE_URL=<your-production-postgres-url>`
- `GOOGLE_CLIENT_ID=<optional, if Google login enabled>`
- `GOOGLE_CLIENT_SECRET=<optional, if Google login enabled>`

Notes:

- Yes, if `NEXTAUTH_URL` is wrong or missing in production, login callbacks can fail.
- Set the same variables in your CI/CD provider secrets (GitHub Actions) so build/deploy pipelines are consistent.

## Task 01: NextAuth (Google + Credentials)

This project uses App Router auth route handlers in:

- `src/app/api/auth/[...nextauth]/route.ts`

Core auth configuration is in:

- `src/lib/auth.ts`

Prisma auth models are in:

- `prisma/schema.prisma` (`User`, `Account`, `Session`, `VerificationToken`)

Client-side login example is in:

- `src/app/login/page.tsx`

Protected server-side route example is in:

- `src/app/protected-example/page.tsx`

### Session Strategy Choice

This project uses `session.strategy = "jwt"` with a Prisma Adapter.

- Why: it reduces DB reads for every session check and works well with serverless/edge-like environments.
- Prisma Adapter is still required for OAuth account linking (`Account`) and optional DB-backed session/account data.

### Required Environment Variables

Set these in local `.env` and in Vercel Project Settings:

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL`

Example local values:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/scholarsync?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace_with_a_strong_random_secret"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

Example production values (Vercel):

```bash
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="replace_with_a_strong_random_secret"
DATABASE_URL="postgresql://..."
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

### Google OAuth Setup Steps

1. Go to Google Cloud Console.
2. Create/select a project.
3. Configure OAuth consent screen (External/Internal, app info, scopes).
4. Create OAuth Client ID (Web application).
5. Add Authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://your-app-name.vercel.app`
6. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-app-name.vercel.app/api/auth/callback/google`
7. Copy Client ID and Client Secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### Quick Verification

```bash
npm install
npx prisma db push
npm run seed
npm run dev
```

Then test:

- Credentials login with a seeded user.
- Google login from `/login`.
- Protected example route at `/protected-example`.

## Task 02: Dockerization

Docker artifacts included:

- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `docker/entrypoint.sh`

### Run with Docker Compose (App + Postgres)

```bash
docker compose up --build
```

App URL:

- `http://localhost:3000`

What happens on startup:

- PostgreSQL starts on `db:5432`
- App container runs `prisma db push` automatically (`RUN_MIGRATIONS=true`)
- Next.js standalone server starts

Optional seed inside Docker:

1. Set in `docker-compose.yml`:
   - `RUN_SEED: 'true'`
2. Recreate containers:

```bash
docker compose down
docker compose up --build
```

### Docker Notes for Production

- Do not use `change_me_before_production` in production.
- Set production secrets via your platform secret manager.
- Set `NEXTAUTH_URL` to your real HTTPS production domain.
