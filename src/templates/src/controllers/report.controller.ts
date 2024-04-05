import { Context } from "elysia";
import { ThreadModel } from "../models/thread.schema";
import * as Sentry from "@sentry/bun";
import logger from "../utils/logger";
import { validateToken } from "../middleware/jwtMiddleware";
// import { startOf, endOf, eachInterval } from "../utils/dateUtils"; // Uncomment this line if you are using dateUtils
// import { DateTime, DateTimeUnit } from "luxon"; // Uncomment this line if you are using Luxon

export const getAllThreads = async (ctx: Context) => {
    try {
        // Extract the JWT token from the Authorization header
        const token = ctx.request.headers
            .get("authorization")
            ?.split(" ")[1] as string;

        // Validate the token
        if (!validateToken(token)) {
            return { status: 401, body: { message: "Invalid or expired token" } };
        }
        // If token is valid, proceed to get threads
        // const threads = await ThreadModel.find({}).select('threadId userStudent runId platform');

        // Get the total count of documents in the ThreadModel
        const totalCount = await ThreadModel.countDocuments();

        return {
            status: 200, // HTTP status code
            body: {
                totalCount, // Total number of documents
                // threads // The actual response body containing only specified fields
            },
        };
    } catch (error: any) {
        Sentry.captureException(error);
        logger.error(`Error in getAllThreads: ${error.message}`);
        return {
            status: 500, // Internal Server Error
            body: { message: "Failed to retrieve threads" },
        };
    }
};

// Get all threads in a specific date range
export const getAllThreadsByDateRange = async (ctx: Context) => {
    try {
        // Extract the JWT token from the Authorization header
        const token = ctx.request.headers
            .get("authorization")
            ?.split(" ")[1] as string;

        // Validate the token
        if (!validateToken(token)) {
            return { status: 401, body: { message: "Invalid or expired token" } };
        }

        const { startDate, endDate } = ctx.query;
        console.log(startDate, endDate);

        // Query to find threads within the date range and select specific fields
        const query = {
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        };

        // const threads = await ThreadModel.find(query).select('threadId userStudent runId platform');

        // Get the total count of documents within the date range
        const totalCount = await ThreadModel.countDocuments(query);

        // Respond with both the threads data and the total count
        return {
            status: 200, // HTTP status code
            body: {
                totalCount, // Total number of documents within the date range
                // threads // The actual response body containing only specified fields
            },
        };
    } catch (error: any) {
        Sentry.captureException(error);
        logger.error(`Error in getAllThreadsByDateRange: ${error.message}`);
        return {
            status: 500, // Internal Server Error
            body: { message: "Failed to retrieve threads" },
        };
    }
};
