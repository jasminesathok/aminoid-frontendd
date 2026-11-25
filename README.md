# Amnoid Frontend
Premium dashboard application built with Vite, React, and Tailwind CSS.

## Quick Start

1. Install dependencies
```bash
npm install
```
2. Copy the example env file
```bash
cp .env.example .env
```
3. Run development
```bash
npm run dev
```
4. Build for production
```bash
npm run build
```
5. Preview the production build
```bash
npm run preview
```

## Environment
Set `VITE_API_URL` to your backend API endpoint.

Example `.env`:
```env
VITE_API_URL=http://localhost:5001
```

## Notes
- The frontend reads `VITE_API_URL` at build time.
- For production, set `VITE_API_URL` to your deployed backend URL.
- Ensure CORS is configured on the backend for the frontend host.
