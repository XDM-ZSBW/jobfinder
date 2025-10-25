# Development Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** - [Download](https://nodejs.org/)
- **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd jobmatch-ai
```

### 2. Install Dependencies

Install all dependencies for the monorepo:

```bash
npm install
```

This will install dependencies for all workspaces (frontend, backend, shared).

### 3. Database Setup

Create a PostgreSQL database:

```bash
createdb jobmatch_ai
```

Or using psql:

```sql
CREATE DATABASE jobmatch_ai;
```

### 4. Environment Variables

#### Backend

Copy the example environment file:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and configure:

```env
# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/jobmatch_ai

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Email (optional for development)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password

# Logging
LOG_LEVEL=info
```

#### Frontend

Copy the example environment file:

```bash
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 5. Database Migration

Run Prisma migrations to set up the database schema:

```bash
npm run migrate --workspace=backend
```

This will create all necessary tables in your database.

### 6. Generate Prisma Client

Generate the Prisma client:

```bash
cd backend
npx prisma generate
cd ..
```

## Running the Application

### Development Mode

Start both frontend and backend in development mode:

```bash
npm run dev
```

This runs both servers concurrently:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

### Run Individually

**Backend only:**
```bash
npm run dev:backend
```

**Frontend only:**
```bash
npm run dev:frontend
```

## Development Tools

### Database Studio

Open Prisma Studio to view and edit database content:

```bash
npm run db:studio --workspace=backend
```

This will open a web interface at http://localhost:5555

### Type Checking

Run TypeScript type checking:

```bash
npm run typecheck
```

### Linting

Run ESLint:

```bash
npm run lint
```

### Testing

Run tests (when implemented):

```bash
npm run test
```

## Project Structure

```
jobmatch-ai/
├── backend/                # Node.js/Express API
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   └── index.ts       # Entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
├── frontend/              # Next.js React app
│   ├── src/
│   │   ├── app/          # Next.js app router
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities
│   │   └── types/        # TypeScript types
│   └── package.json
├── shared/               # Shared types and utilities
│   ├── types/
│   │   └── index.ts
│   └── package.json
├── docs/                 # Documentation
└── package.json          # Root package.json
```

## Common Issues

### Port Already in Use

If ports 3000 or 4000 are already in use, you can change them:

**Backend**: Edit `PORT` in `backend/.env`
**Frontend**: Run with `PORT=3001 npm run dev:frontend`

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Check your `DATABASE_URL` in `backend/.env`
3. Verify database credentials

### Missing Dependencies

If you encounter missing dependencies:

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Prisma Issues

If Prisma gives errors, try:

```bash
cd backend
npx prisma generate
npx prisma migrate reset
cd ..
```

## Next Steps

1. Review the [API Documentation](./API.md)
2. Understand the [Architecture](../README.md#architecture)
3. Set up your OpenAI API key for AI features
4. Start building!

## Getting Help

- Check existing documentation in `/docs`
- Review code comments
- Open an issue on GitHub
