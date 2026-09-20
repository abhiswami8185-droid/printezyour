# PrintezYour - Modern Printing & E-Commerce System

Official website, online custom printing ordering system, and enterprise business management portal for **PrintezYour** (Chandigarh).

PrintezYour is a production-ready, full-stack print commerce platform designed for commercial offset, digital quick-print, corporate merchandise, large format signage, and packaging solutions.

---

## Features

- **Storefront & Catalog**:
  - Full product catalog with categories, multi-image galleries, and instant search.
  - Interactive specification and pricing calculator (finishing, paper stock, quantities).
  - 20+ commercial printing service listings with detailed turnaround and material specs.
  - Artwork upload support (PDF, AI, CDR, TIFF, PNG, JPG).
- **Checkout & Ordering**:
  - Responsive shopping cart drawer and checkout flow.
  - Automated WhatsApp order synchronization with structured invoice formatting.
  - Multi-method payment support (UPI QR code, bank transfer, cash on delivery).
- **Business Administration Portal**:
  - Secure credential-based admin dashboard at `/#/admin`.
  - Comprehensive order pipeline management (Pending, On Press, Finished, Dispatched).
  - Live inventory tracking with automatic consumption rules for raw paper/vinyl stock.
  - Rich product & service editor with sample asset picker and custom photo manager.
  - Business analytics, revenue tracking, and order export capabilities.
- **Enterprise Deployment Ready**:
  - Runs as a unified Node.js full-stack app or as a decoupled static frontend + API backend.
  - Full support for sub-path hosting (e.g. GitHub Pages) with relative asset loading.
  - Built-in CORS, security headers, and single-bundle CommonJS server execution.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS 4, Lucide React icons, Motion animations.
- **Backend**: Node.js, Express, Multer (file handling), Sharp (image optimization), esbuild.
- **Persistence**: File-backed JSON store with in-memory caching and persistent uploads directory.

---

## Getting Started

### 1. Prerequisites
- Node.js **18+** or **20+**
- npm 9+

### 2. Installation
```bash
git clone https://github.com/yourusername/printezyour.git
cd printezyour
npm install
```

### 3. Local Development
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

---

## Production Build & Execution

### Full-Stack Build (Frontend + Backend Server)
```bash
# Builds frontend to dist/ and bundles server to dist/server.cjs
npm run build

# Start production server
npm run start
```

### Frontend-Only Build (For GitHub Pages, Cloudflare Pages, Vercel)
```bash
npm run build:client
```

---

## Environment Variables

Copy `.env.example` to `.env` and customize as needed:

| Variable | Description | Default |
|---|---|---|
| `PORT` | Node.js HTTP server port | `3000` |
| `NODE_ENV` | Runtime environment (`production` / `development`) | `production` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend CORS origins | `*` |
| `VITE_BASE_PATH` | Base URL path for assets and routing (e.g. `./` or `/repo/`) | `./` |
| `VITE_API_URL` | Remote API base URL when frontend is hosted separately | (empty, uses same-origin) |
| `APP_URL` | Canonical app URL | (injected by host) |

See [.env.example](.env.example) for additional domain separation variables.

---

## Deployment Documentation

For detailed deployment guides covering:
- **Hostinger Node.js & VPS Hosting**
- **GitHub Pages (with GitHub Actions workflow)**
- **Cloudflare Pages / Vercel / Netlify**
- **Decoupled Frontend + Backend Architecture**

Refer to the complete guide in [DEPLOYMENT.md](DEPLOYMENT.md).

---

## License & Attribution

Designed and maintained for **PrintezYour** (Plot No 1794, Gym Deep Complex, Hallo Majra, Chandigarh - 160002).
