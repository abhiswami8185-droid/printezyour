import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/api';

async function startServer() {
  const app = express();
  // Port 3000 is required by the reverse proxy infrastructure
  const PORT = 3000;

  app.set('trust proxy', true);

  // Basic security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Cross-Origin Resource Sharing (CORS) for external frontend hosting (GitHub Pages, Vercel, Netlify)
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN;
  const configuredOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map(o => o.trim()).filter(Boolean)
    : [];

  // Known production frontend hosts
  const trustedOrigins = [
    'https://abhiswami8185-droid.github.io',
    'https://printezyour.com',
    'https://admin.printezyour.com',
    'https://printezyour.ai.studio'
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server, or same-origin)
      if (!origin) return callback(null, true);

      // Check configured origins or wildcards
      if (
        configuredOrigins.length === 0 ||
        configuredOrigins.includes('*') ||
        configuredOrigins.includes(origin) ||
        trustedOrigins.includes(origin) ||
        origin.endsWith('.github.io') ||
        origin.endsWith('.ai.studio') ||
        origin.endsWith('.run.app')
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token', 'X-Requested-With']
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'PrintezYour Enterprise Engine',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API router
  app.use('/api', apiRouter);

  // Catch-all 404 handler for API routes to prevent falling through to HTML index
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  // Vite middleware for dev / static for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PrintezYour Engine] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
