import * as mongoose from 'mongoose';
import * as Sentry from "@sentry/bun";
import logger from './utils/logger';
import { config } from './config';

export async function connectToDatabase() {
    try {
        await mongoose.connect(config.MONGODB_URI, {
            maxPoolSize: 10,
            socketTimeoutMS: 20000,
        });
        logger.info('Mongoose connected successfully');
    } catch (error) {
        Sentry.captureException(error);
        logger.error(`Mongoose connection error: ${error}`);
        // Optionally, you can rethrow the error or handle it as needed
        throw error;
    }
}
