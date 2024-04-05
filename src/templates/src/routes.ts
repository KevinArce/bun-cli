import { Elysia, Context } from "elysia";
import { registerUser, loginUser } from "./controllers/user.controller";
import {
    getAllThreads,
    getAllThreadsByDateRange,
} from "./controllers/report.controller";
// import { verifyToken } from "./middleware/jwtMiddleware"; // Uncomment this line if you are using jwtMiddleware

export const setupRoutes = (app: Elysia) => {
    // Home route
    app.get("/", async (ctx) => {
        return {
            status: 200,
            body: {
                message: "Hello Bun! 🚀",
            },
        };
    });

    // Handle all unhandled requests
    app.all("*", async (ctx) => {
        ctx.set.status = 404;
        return "Not Found";
    });

    // User registration route
    app.post("/register", registerUser);

    // User login route
    app.post("/login", loginUser);

    // Get all threads route
    app.get("/threads", getAllThreads);

    // Get all threads in a specific date range
    app.get("/threads/date-range", getAllThreadsByDateRange);
};
