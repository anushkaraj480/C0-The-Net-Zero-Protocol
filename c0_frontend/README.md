# C0 Frontend — React + Vite + TypeScript

Interactive dashboard and marketplace UI for the C0 Net-Zero Protocol.

## Setup

```bash
npm install
npm run dev     # → http://localhost:5173
```

## Key Directories

- `src/api/` — Axios client with JWT interceptors (auto-refresh)
- `src/context/` — AuthContext for global auth state
- `src/components/` — UI components (Dashboard, Marketplace, 3D Earth, etc.)
- `public/textures/` — Three.js earth textures

## Scripts

| Command         | Description                      |
|-----------------|----------------------------------|
| `npm run dev`   | Start Vite dev server            |
| `npm run build` | Production build                 |
| `npm run lint`  | ESLint                           |
| `npm run dep:validate` | Dependency graph validation |
