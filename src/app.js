import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // allow to server to accept request from different origin
    credentials: true, // allow session cookie from browser to pass through
  })
);

// common middlewares
app.use(express.json({ limit: "16kb" })); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static("public")); // serve static files
app.use(cookieParser());

// import routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import useRouter from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/error.handler.js";

//routes
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", useRouter);
app.use(errorHandler);
export { app }; // Export app to be used in index.js
