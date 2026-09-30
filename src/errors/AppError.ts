class AppError {
    message: string
    statusCode: number

    constructor(message: string, statusCode: number = 400) {
        this.statusCode = statusCode
        this.message = message
    }
}

export { AppError }