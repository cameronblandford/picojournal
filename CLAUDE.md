# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev              # Start development server with turbopack
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run db:seed         # Seed database with test data
npm run db:reset        # Reset database and re-seed
npx prisma db push      # Push schema changes to database
npx prisma generate     # Generate Prisma client
npx prisma studio       # Open database browser
npx prisma migrate dev  # Create and apply migrations
```

## Architecture Overview

PicoJournal is a Next.js 15 PWA for daily journaling with the following key architectural patterns:

### Authentication Flow
- Uses NextAuth.js with credentials provider and JWT strategy
- Custom sign-in/sign-up pages at `/auth/signin` and `/auth/signup`
- Password hashing with bcryptjs
- Session management via JWT tokens with custom callbacks in `src/lib/auth.ts`

### Data Model
- PostgreSQL with Prisma ORM
- Core entity: `Entry` with unique constraint on `(userId, date)` 
- Date handling: Entries use `@db.Date` type, stored as UTC dates
- One entry per user per day enforced at database level

### API Structure
- `/api/entries` - CRUD operations for journal entries
- `/api/entries/historical` - Fetches entries from 1 week, 1 month, and 1 year ago
- `/api/auth/register` - User registration endpoint
- All APIs require authentication via NextAuth session

### Frontend Components
- `JournalEntry.tsx` - Main entry form with 280 character limit and auto-save
- `HistoricalEntries.tsx` - Displays past entries for reflection
- `RecentEntries.tsx` - Shows recent journal entries
- `Providers.tsx` - NextAuth session provider wrapper

### Date Handling Critical Notes
- Historical lookback uses exact date matching (not date ranges)
- Dates stored as UTC in database but calculations done in local timezone
- Use `toISOString().split('T')[0]` pattern for date string formatting
- Create Date objects with `'YYYY-MM-DD' + 'T00:00:00.000Z'` for UTC consistency

### PWA Configuration
- Configured with next-pwa
- Manifest at `/public/manifest.json`
- Service worker enabled for offline functionality
- Icons and theme color configured in layout

## Environment Variables Required

```
DATABASE_URL="postgresql://localhost:5432/picojournal"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```