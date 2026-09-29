import express, { Request, Response, NextFunction, response } from "express"
import 'dotenv/config'
import { app } from "./app.js"

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("Server is running..." + PORT)
})

