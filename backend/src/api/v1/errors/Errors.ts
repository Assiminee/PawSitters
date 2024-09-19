/**
 * Base class for application-specific errors.
 * Extends the built-in Error class to include an HTTP status code and additional JSON data.
 */
export class AppError extends Error {
    /**
     * Creates an instance of AppError.
     *
     * @param {string} message - The error message.
     * @param {number} [statusCode=400] - The HTTP status code associated with the error (default is 400).
     * @param {object} json - Additional JSON data to include with the error.
     */
    constructor(message: string, public statusCode: number = 400, public json : object) {
        super(message);
        this.name = "AppError";
        this.json = json;
    }
}

/**
 * Error class for invalid data errors.
 * Inherits from AppError with a default status code of 400 (Bad Request).
 */
export class InvalidDataError extends AppError {
    /**
     * Creates an instance of InvalidDataError.
     *
     * @param {string} message - The error message.
     * @param {object} json - Additional JSON data to include with the error.
     */
    constructor(message: string, json : object) {
        super(message, 400, json);
    }
}

/**
 * Error class for not found errors.
 * Inherits from AppError with a default status code of 404 (Not Found).
 */
export class NotFoundError extends AppError {
    /**
     * Creates an instance of NotFoundError.
     *
     * @param {string} message - The error message.
     * @param {object} json - Additional JSON data to include with the error.
     */
    constructor(message: string, json : object) {
        super(message, 404, json);
    }
}

/**
 * Error class for conflict errors.
 * Inherits from AppError with a default status code of 409 (Conflict).
 */
export class ConflictError extends AppError {
    /**
     * Creates an instance of ConflictError.
     *
     * @param {string} message - The error message.
     * @param {object} json - Additional JSON data to include with the error.
     */
    constructor(message: string, json : object) {
        super(message, 409, json);
    }
}

/**
 * Error class for forbidden request errors.
 * Inherits from AppError with a default status code of 403 (Forbidden).
 */
export class ForbiddenRequest extends AppError {
    /**
     * Creates an instance of ForbiddenRequest.
     *
     * @param {string} message - The error message.
     * @param {object} json - Additional JSON data to include with the error.
     */
    constructor(message: string, json : object) {
        super(message, 403, json);
    }
}