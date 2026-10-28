# iMovies

A modern cinema ticket booking experience built with React, TypeScript, Vite, Tailwind CSS, Lucide icons, and Supabase.

## Features

- Browse now-playing and upcoming films
- Search films by title
- Filter films by genre
- View cinema showtimes and formats
- Select seats with an interactive seating layout
- Submit a booking and receive a confirmation reference
- Supabase-backed movies, showtimes, and bookings
- Responsive design for mobile, tablet, and desktop

## Tech stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- Lucide React

## Project structure

```text
imovies/
├── public/                         # Static public assets, if added later
├── src/
│   ├── lib/
│   │   └── supabase.ts             # Supabase client
│   ├── App.tsx                     # Main cinema experience
│   ├── index.css                   # Global styles and Tailwind layers
│   ├── main.tsx                    # React entry point
│   └── vite-env.d.ts               # Vite type declarations
├── supabase/
│   └── migrations/                 # Database schema and seed data
├── .env.example                    # Required environment variable names
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Environment variables

Create a local `.env` file from `.env.example` and add the Supabase project values provided for your environment.

Never commit `.env` to GitHub. It is intentionally excluded by `.gitignore`.

## Database

The migration in `supabase/migrations/` creates and seeds:

- `movies`
- `showtimes`
- `bookings`

Run the migration through your Supabase project before using the live catalog and booking persistence.

## Available scripts

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Deployment

This is a standard Vite application. Build the project with `npm run build`, then deploy the generated `dist/` directory to your preferred static hosting provider.
