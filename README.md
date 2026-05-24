# Budgetly

Budgetly is a production-ready React + TypeScript monthly budget tracker built with Vite. It tracks income, expenses, savings goals, subscriptions, CSV/PDF export, responsive charts, and offline PWA installation.

## Quick Start

```bash
npm install
npm run dev
npm run build
```

Optional checks:

```bash
npm run lint
npm run format:check
```

## Environment

Copy `.env.example` to `.env` when you need local overrides.

```bash
VITE_APP_NAME=Budgetly
VITE_BASE_PATH=/
VITE_DEV_PORT=5173
```

Use `VITE_BASE_PATH=/your-repo-name/` before building for GitHub Pages.

## PWA

The app includes `public/manifest.json`, app icons, a custom `public/sw.js` service worker, offline navigation fallback, and runtime caching for built assets. Install prompts appear on browsers that support `beforeinstallprompt`. iOS users can install with Safari's Add to Home Screen flow.

For the service worker to work, serve the app over HTTPS or `localhost`.

## Deployment

### Vercel

1. Import the repository in Vercel.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Leave `VITE_BASE_PATH=/`.

### Netlify

1. Create a new site from the repository.
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. Add `VITE_BASE_PATH=/` in site environment variables if needed.

### GitHub Pages

1. Set `VITE_BASE_PATH=/repository-name/` in `.env` or your workflow.
2. Run `npm run build`.
3. Publish the `dist` directory.

Routing uses `createHashRouter`, so direct refreshes work on static hosts without custom rewrite rules.

## Project Structure

```text
src/
  components/   reusable UI and layout components
  hooks/        budget storage and PWA install hooks
  pages/        routed app screens
  utils/        formatting, storage, and export helpers
public/
  icons/        PWA icons
  manifest.json
  sw.js
```
