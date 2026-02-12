import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { authRoutes } from './routes/auth';
import { vaultRoutes } from './routes/vault';

const app = new Elysia()
    // CORS configuration - allows frontend to communicate with backend
    .use(
        cors({
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        })
    )
    // Health check endpoint
    .get('/health', () => ({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    }))
    // API routes
    .group('/api', (app) =>
        app
            .use(authRoutes)
            .use(vaultRoutes)
    )
    .listen(process.env.PORT || 3001);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
