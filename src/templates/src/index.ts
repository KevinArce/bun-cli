import { Elysia } from 'elysia';
import * as Sentry from "@sentry/bun";
import { cors } from '@elysiajs/cors';
import logger from './utils/logger';
import { swagger } from '@elysiajs/swagger';
import { connectToDatabase } from './database';
import { setupRoutes } from './routes';
import { config } from './config';

// Add Sentry
Sentry.init({
    dsn: config.SENTRY_DSN,
    release: config.SENTRY_RELEASE,
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions
});

class Unauthorized extends Error {
    constructor() {
        super('Unauthorized');
    }
}

try {
    // Connect to the database
    await connectToDatabase();

    // Create a new Elysia application
    const app = new Elysia().use(cors());

    // Add Error Handler
    app.error({
        '401': Unauthorized
    }).onError(({ code, error }) => {

        let status;

        switch (true) {
            case code === 'VALIDATION':
                status = 400;
                break;
            case code === 'NOT_FOUND':
                status = 404;
                break;
            case code === '401':
                status = 401;
                break;
            default:
                status = 500;
        }

        return new Response(error.toString(), { status: status })
    });

    // Add CORS
    app.use(cors(
        {
            origin: '*', // Allow from everywhere
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            exposedHeaders: ['Content-Type', 'Authorization'],
        }
    ));

    // Add Swagger
    app.use(swagger({
        path: '/v1/swagger',
        documentation: {
            info: {
                title: 'Elysia API',
                version: '1.0.0',
                description: 'This is the API documentation for the Elysia API',
            }
        },
    }));

    // Setup routes
    setupRoutes(app);

    // Start the server
    app.listen(8080, () => {
        logger.info(`Server listening on http://${app.server!.hostname}:${app.server!.port}`);
    });

} catch (error) {
    logger.error(`Error starting the server: ${error}`);
    process.exit(1);
}
