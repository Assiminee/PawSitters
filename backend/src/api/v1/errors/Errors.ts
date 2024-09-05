export class AppError extends Error {
    constructor(message: string, public statusCode: number = 400, public json : object) {
        super(message);
        this.name = "AppError";
        this.json = json;
    }
}

export class InvalidDataError extends AppError {
    constructor(message: string, json : object) {
        super(message, 400, json);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string, json : object) {
        super(message, 404, json);
    }
}

export class ConflictError extends AppError {
    constructor(message: string, json : object) {
        super(message, 409, json);
    }
}

export class ForbiddenRequest extends AppError {
    constructor(message: string, json : object) {
        super(message, 403, json);
    }
}