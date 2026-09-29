import express, { Response, Request, NextFunction} from "express"
import { errorHandling } from "./Middlewares/error-handling.js"

const app = express()

app.use(errorHandling)

export { app }

