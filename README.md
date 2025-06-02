# PicoJournal

A simple daily journaling Progressive Web App (PWA) where you write one sentence per day about your day.

## Features

- **Daily Journaling**: Write one sentence per day (280 character limit)
- **Historical Lookback**: See entries from one week ago, one month ago, and one year ago
- **Recent Entries**: Browse your past journal entries
- **Authentication**: Secure sign up and login system
- **PWA Support**: Install as an app on your device
- **PostgreSQL Backend**: Reliable data storage
- **Responsive Design**: Works great on mobile and desktop

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **PWA**: next-pwa for service worker and manifest

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cameronblandford/picojournal.git
cd picojournal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database URL and authentication secrets:
```
DATABASE_URL="postgresql://localhost:5432/picojournal"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma db push
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Usage

1. **Sign Up**: Create an account with email and password
2. **Daily Entry**: Write one sentence about your day (up to 280 characters)
3. **Historical View**: See what you wrote on this day in previous weeks, months, and years
4. **Browse Entries**: Look through your recent journal entries

## PWA Installation

When visiting the app in a supported browser, you'll see an option to "Add to Home Screen" or "Install App". This allows you to use PicoJournal like a native app on your device.

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npx prisma migrate dev

# View database
npx prisma studio
```

## License

MIT License - see LICENSE file for details.