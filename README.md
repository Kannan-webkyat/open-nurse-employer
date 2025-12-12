# Open Nurses Dashboard

A modern dashboard application for managing nursing job postings, built with Next.js, Tailwind CSS, and shadcn/ui components.

## Features

- **Dashboard Layout**: Clean header with navigation sidebar
- **Jobs Management**: Complete job posting management with search, filters, and pagination
- **Responsive Design**: Modern UI matching the exact design specifications
- **Navigation**: Full navigation menu with all sections

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide React (icons)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── dashboard/     # Dashboard page
│   ├── jobs/          # Jobs management page
│   ├── candidates/    # Candidates page
│   ├── billing/       # Billing page
│   ├── reports/       # Reports page
│   ├── settings/      # Settings page
│   ├── support/       # Support page
│   ├── layout.tsx     # Root layout
│   └── globals.css    # Global styles
├── components/
│   ├── dashboard/     # Dashboard components (header, sidebar, layout)
│   └── ui/            # shadcn/ui components
└── lib/
    └── utils.ts       # Utility functions
```

## Pages

- `/dashboard` - Main dashboard
- `/jobs` - Jobs management (main page)
- `/candidates` - Candidates management
- `/billing` - Billing & Subscriptions
- `/reports` - Reports & Insights
- `/settings` - Settings
- `/support` - Support / Help Center

