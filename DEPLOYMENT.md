# PrintezYour - Production Deployment Guide

This guide provides clear, step-by-step instructions for deploying **PrintezYour** to both **Node.js hosting** (e.g., Hostinger, VPS, Cloud Run) and **Static frontend hosting** (e.g., GitHub Pages, Cloudflare Pages, Vercel, Netlify).

---

## Quick Architecture Summary

PrintezYour is architected with dual-mode deployment flexibility:

1. **Full-Stack Monolith (Recommended for full functionality)**:
   - Node.js Express server handles both REST API endpoints (`/api/*`) and serves compiled static frontend assets (`dist/`).
   - Best for: Hostinger Node.js hosting, VPS (Ubuntu/Debian with PM2 or Nginx), Cloud Run, Render, Railway.
2. **Decoupled Architecture**:
   - **Frontend**: Hosted on GitHub Pages, Cloudflare Pages, Vercel, or Netlify as a static Single Page Application (SPA).
   - **Backend**: Hosted on Hostinger or VPS running the Node.js API with CORS enabled.
3. **Static Standalone (Catalog & Quote Mode)**:
   - Frontend runs statically with local fallback data and direct WhatsApp order dispatching.

---

## 1. Full-Stack Node.js Deployment (Hostinger / VPS / cPanel)

### Prerequisites
- Node.js **18.x** or **20.x** (LTS recommended)
- Access to Hostinger cPanel / hPanel Node.js selector or SSH terminal

### Step-by-Step Instructions

#### Step 1: Upload Files
1. Export or clone the repository to your server root or domain directory (e.g., `/home/username/public_html` or `/home/username/printezyour`).
2. Ensure all files including `package.json`, `server.ts`, `vite.config.ts`, and `src/` are present.
3. *Note*: Do not upload `node_modules` or `.git` if uploading via ZIP.

#### Step 2: Install Dependencies
Open your server terminal or SSH:
```bash
cd printezyour
npm install
```

#### Step 3: Configure Environment Variables
Create a `.env` file in the project root:
```env
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=*
APP_URL=https://yourdomain.com
```

#### Step 4: Build the Project
Run the production build command:
```bash
npm run build
```
This builds both:
- The React frontend into `dist/`
- The bundled Node server into `dist/server.cjs`

#### Step 5: Start the Application

##### Option A: Using Hostinger hPanel Node.js Application Manager
- **Node.js version**: Select `Node.js 18.x` or `20.x`
- **Application root**: `printezyour` (or root path)
- **Application startup file**: `dist/server.cjs`
- Click **Run NPM Install** and then **Start App**.

##### Option B: Using PM2 (Recommended for VPS / Cloud Servers)
```bash
npm install -g pm2
pm2 start dist/server.cjs --name "printezyour"
pm2 save
pm2 startup
```

##### Option C: Standard Node Start
```bash
npm run start
```

---

## 2. Static Frontend Deployment (GitHub Pages)

### Target Environment Details
- **Repository Name**: `printezyour`
- **Expected Production URL**: `https://abhiswami8185-droid.github.io/printezyour/`
- **Sub-Path Base**: `/printezyour/`

PrintezYour is fully configured for GitHub Pages sub-path hosting:
- Built-in asset helper (`getAssetUrl`) dynamically handles `/printezyour/` prefixes for logos, product photos, and icons.
- `public/404.html` automatically catches sub-path reloads and translates them into clean hash routes (`#/admin`, `#/products`, etc.).
- The workflow file `.github/workflows/deploy.yml` is already committed to the repository.

### Method A: Automated GitHub Actions (Recommended)

1. In your GitHub repository (`abhiswami8185-droid/printezyour`), navigate to **Settings** > **Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push your code to the `main` or `master` branch. The included workflow (`.github/workflows/deploy.yml`) will automatically trigger:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main', 'master']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build static site for GitHub Pages
        env:
          VITE_BASE_PATH: '/printezyour/'
        run: npm run build:client

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

4. Once the action completes (typically under 1 minute), your site will be live at:
   `https://abhiswami8185-droid.github.io/printezyour/`

### Method B: Manual Build & Push to `gh-pages`

```bash
# 1. Install dependencies
npm install

# 2. Build for static hosting
VITE_BASE_PATH="./" npm run build:client

# 3. Deploy dist folder to gh-pages branch (using npx gh-pages)
npx gh-pages -d dist
```

---

## 3. Static Hosting on Vercel / Netlify / Cloudflare Pages

### Vercel
1. Connect your repository in the Vercel Dashboard.
2. Framework Preset: **Vite**
3. Build Command: `npm run build:client`
4. Output Directory: `dist`
5. If using a separate backend, add environment variable:
   - `VITE_API_URL`: `https://your-backend-api.com`

### Netlify
1. Connect repository in Netlify.
2. Build Command: `npm run build:client`
3. Publish directory: `dist`
4. Netlify automatically respects SPA redirects; `public/404.html` acts as a universal fallback.

### Cloudflare Pages
1. Connect repository in Cloudflare dashboard under **Workers & Pages**.
2. Framework preset: **Vite**
3. Build command: `npm run build:client`
4. Build output directory: `dist`

---

## 4. Decoupled Setup (Separate Static Frontend + Node Backend)

For maximum performance and zero frontend hosting costs:

1. **Deploy Backend (Node.js on Hostinger or VPS)**:
   - Configure `.env`:
     ```env
     PORT=3000
     ALLOWED_ORIGINS=https://username.github.io,https://printezyour.com
     ```
   - Run `npm run build && npm run start` on the server.
   - Your API will be accessible at `https://api.yourdomain.com/api/products`, etc.

2. **Deploy Frontend (GitHub Pages or Vercel)**:
   - In your frontend build environment, configure:
     ```env
     VITE_API_URL=https://api.yourdomain.com
     ```
   - Build with `npm run build:client`.
   - The frontend will automatically route all catalog, cart, quote, and admin calls to your live backend.

---

## 5. Deployment Troubleshooting & FAQ

| Problem | Cause | Solution |
|---|---|---|
| **White screen / Blank page** | Hardcoded absolute paths (`/assets/...`) | PrintezYour uses `VITE_BASE_PATH=./` and relative asset resolution. Ensure you build using `npm run build` or `npm run build:client`. |
| **Page refresh shows 404 on GitHub Pages** | SPA routing doesn't match a physical file on subpaths | PrintezYour includes `public/404.html` and hash navigation (`/#/admin`, `/#/products`) which prevents 404s. |
| **CORS error in browser console** | Backend is blocking foreign origin requests | In the backend `.env`, set `ALLOWED_ORIGINS=*` or add your exact frontend URL. |
| **Images or product photos missing** | Missing placeholder or incorrect path | All product and service images include built-in fallbacks and dynamic base path resolution (`getAssetUrl`). |
| **Server port already in use** | Default port 3000 is occupied by another process | Set `PORT=3001` or another port in `.env`. The server automatically listens to `process.env.PORT`. |

---

## 6. Verification Checklist

Before opening to customers:
- [ ] Open home page and verify hero banner and all 6 category cards load.
- [ ] Browse **Products** and **Services** catalogs to confirm images load properly.
- [ ] Add an item to the cart and proceed to Checkout.
- [ ] Test the WhatsApp order placement button.
- [ ] Access the Admin panel (`/#/admin`) and verify product & order management.
