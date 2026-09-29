import express, { Request, Response, NextFunction, response } from "express"

const app = express()

const PORT = 3333

app.listen(PORT, () => {
    console.log("Server is running")
})

