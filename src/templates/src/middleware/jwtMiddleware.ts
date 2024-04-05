import jwt from 'jsonwebtoken';
import { Context } from 'elysia';
import { config } from '../config';
import logger from '../utils/logger';

const jwtSecret = config.JWT_SECRETS;

export const verifyToken = async (ctx: Context, next: () => Promise<void>) => {
    const authHeader = ctx.request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    logger.info(`JWT token 0: ${token}`);

    if (!token) {
        ctx.set.status = 401;
        ctx.body = { message: 'No token provided' };
        return;
    }

    try {
        jwt.verify(token, jwtSecret);
        await next();
    } catch (error) {
        ctx.set.status = 401;
        ctx.body = { message: 'Invalid or expired token' };
    }
};

export const validateToken = (token: string): boolean => {
    logger.info(`JWT token 1: ${token}`);
    if (!token) {
        logger.info('No token provided');
        return false;
    }

    try {
        logger.info(`JWT token 2: ${token}`);
        jwt.verify(token, jwtSecret);
        logger.info('JWT token validated successfully');
        return true;
    } catch (error: any) {
        logger.info(`JWT token 3: ${token}`);
        logger.error(`JWT verification error: ${error.message}`);
        return false;
    }
};