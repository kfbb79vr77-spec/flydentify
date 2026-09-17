# Flydentify

**Fool the Fish.** — The intelligent fly-fishing companion for freshwater and saltwater anglers.

Flydentify is a mobile-first web application (React + Node.js) that delivers real-time water conditions, hatch intelligence, fly selection, rigging guidance, trip planning, and location-aware fishing recommendations. A native iOS wrapper (Capacitor) is included for App Store distribution.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (via Drizzle ORM) |
| iOS | Capacitor 6 |
| Payments | StoreKit 2 (iOS native) |
| Maps | Leaflet |
| Bundler | Vite (client) + esbuild (server) |

---

## Project Structure

```
flydentify/
├── client/                  # React frontend
│   ├── src/
│   │   ├── assets/          # Static images and videos
│   │   ├── components/      # Shared UI components
│   │   │   └── ui/          # shadcn/ui component library
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Data, utilities, context
│   │   └── pages/           # Route-level page components
│   └── index.html
├── server/                  # Express backend
│   ├── index.ts             # App entry point
│   ├── routes.ts            # Main API routes
│   ├── monetizationRoutes.ts# Subscription and payment routes
│   ├── streamRoutes.ts      # USGS stream gauge routes
│   ├── forecastEngine.ts    # Fishing forecast logic
│   ├── storage.ts           # Drizzle ORM database layer
│   ├── static.ts            # Static file serving
│   └── vite.ts              # Dev-mode Vite integration
├── shared/
│   └── schema.ts            # Drizzle schema + Zod types (shared FE/BE)
├── ios/                     # Capacitor iOS project
│   └── App/                 # Xcode project
├── script/
│   └── build.ts             # Production build script
├── attached_assets/         # Runtime image/media assets
├── data.db                  # SQLite database (created on first run)
├── drizzle.config.ts        # Drizzle ORM configuration
├── capacitor.config.ts      # Capacitor configuration
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
├── railway.json             # Railway deployment config
├── nixpacks.toml            # Nixpacks build config
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Environment variables

```bash
cp .env.example .env
# Edit .env and fill in required values (see .env.example for descriptions)
```

### Development

```bash
npm run dev
```

The app runs at `http://localhost:5000`.

### Production build

```bash
npm install --save-dev tsx
npx tsx script/build.ts
```

### Start production server

```bash
node dist/index.cjs
```

---

## Database

The app uses SQLite via Drizzle ORM. The database file is `data.db` in the project root.

### Schema

Defined in `shared/schema.ts`. Tables:

- `users` — registered accounts with subscription status
- `subscribers` — newsletter and waitlist email captures
- `fishing_reports` — saved fishing session records
- `hatch_reports` — community hatch observations
- `trip_plans` — user-created trip plans
- `trip_kits` — gear and fly selection kits
- `catch_reports` — individual catch records with GPS
- `waypoints` — saved map waypoints

### Migrations

Drizzle handles schema migrations. To push schema changes to the database:

```bash
npx drizzle-kit push
```

To generate migration files:

```bash
npx drizzle-kit generate
```

---

## iOS (Capacitor)

The `ios/` directory contains a Capacitor 6 Xcode project targeting iOS 16+.

### Build for iOS

1. Build the web app: `npx tsx script/build.ts`
2. Sync to Capacitor: `npx cap sync ios`
3. Open in Xcode: `npx cap open ios`
4. Set your Team ID and bundle ID (`com.flydentify.app`) in Xcode signing settings
5. Build and run on device or simulator

### In-app purchases

Configured via StoreKit 2. Products:
- `com.flydentify.monthly` — $6.99/month (7-day free trial)
- `com.flydentify.annual` — $39.99/year (7-day free trial)

Configure these in App Store Connect under your app's In-App Purchases section.

---

## API Reference

See `API.md` for full endpoint documentation.

---

## Deployment

### Railway (recommended)

The project includes `railway.json` and `nixpacks.toml` for zero-config Railway deployment.

1. Connect the repo to Railway
2. Set environment variables in the Railway dashboard
3. Railway auto-detects the build command and start command

### Environment variables required for production

See `.env.example` for all variables. The minimum required set:

- `NODE_ENV=production`
- `SESSION_SECRET` — generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `PORT` — defaults to 5000

Optional (enable additional features):
- `GOOGLE_PLACES_KEY` — enables live lodging/restaurant lookups
- `ADMIN_TOKEN` — protects admin endpoints

---

## Brand

- **App name:** Flydentify
- **Tagline:** Fool the Fish.
- **AI assistant:** Lloyd
- **Support:** support@flydentify.com
- **Launch target:** October 15, 2026

---

## License

Proprietary. All rights reserved. © 2026 Flydentify LLC.
