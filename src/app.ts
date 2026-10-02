import express, { Response, Request, NextFunction } from "express";
import { errorHandling } from "./Middlewares/error-handling.js";
import { routes } from "./routes.js";

const app = express();

app.use(express.json());
app.use("/api", routes);
app.use(errorHandling);

export { app };
