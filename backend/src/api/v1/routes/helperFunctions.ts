import {EntityPropertyNotFoundError} from "typeorm";
import {AppError} from "../errors/Errors";
import {NextFunction, Request, Response} from "express";
import path from "path";
import multer from 'multer';

/**
 * Path where uploaded files will be stored.
 * @constant {string}
 */
export const uploads = path.resolve(process.cwd(), "..") + '/public/uploads';

/**
 * Converts all keys in the provided object to lowercase.
 *
 * @param {object} body - The object whose keys need to be converted.
 * @returns a new object with keys in lowercase.
 */
export const validateBody = (body: object) => {
    return Object.fromEntries(
        Object.entries(body).map(([key, value]) =>
            [key.toLowerCase(), value]
        ));
}

/**
 * Generates an appropriate response based on the error type.
 *
 * @param {any} err - The error object.
 * @returns {[number, object]} - An array containing the status code and JSON error response.
 */
export const resData = (err: any): [number, object] => {
    let statusCode = 500;
    let message = err;
    let json = {};

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        json = err.json;
    }

    if (err instanceof EntityPropertyNotFoundError) {
        statusCode = 400;
        message = "An invalid property was requested. Please verify your request and try again.";
    }

    json = {error_message: message, ...json}

    console.error(err);

    return [statusCode, json];
}

/**
 * Checks if the provided keys match the required keys.
 *
 * @param {string[]} keys - Array of keys to check.
 * @param {string[]} requiredKeys - Array of required keys.
 * @returns true if keys match the required keys, false otherwise.
 */
const matchingParams = (keys: string[], requiredKeys: string[]) => {
    keys = keys.map(key => key.toLowerCase());

    return (
        requiredKeys.length === keys.length &&
        keys.every((key) => requiredKeys.includes(key))
    );
}

/**
 * Validates if a date is valid.
 *
 * @param {Date|string} date - The date to validate.
 * @returns {Date|null} - The parsed date if valid, otherwise null.
 */
const isValidDate = (date: Date | string): Date | null => {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

/**
 * Checks if the start and end dates are within a valid interval.
 *
 * @param {Date|string} start_date - The start date.
 * @param {Date|string} end_date - The end date.
 * @returns {boolean} - True if the interval is valid, false otherwise.
 */
const validInterval = (start_date: Date | string, end_date: Date | string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validStartDate = isValidDate(start_date);
    const validEndDate = isValidDate(end_date);

    if (!validStartDate || !validEndDate) {
        return false;
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const startIsInFuture = (validStartDate.getTime() - today.getTime()) / millisecondsPerDay >= 1;

    const validInterval = (validEndDate.getTime() - validStartDate.getTime()) / millisecondsPerDay >= 1;

    return startIsInFuture && validInterval;
}

/**
 * Validates query parameters for specific fields and values.
 *
 * @param {Record<string, any>} params - The query parameters to validate.
 * @returns true if parameters are valid, false otherwise.
 */
const isValidValues = (params: Record<string, any>) => {
    return (
        matchingParams(Object.keys(params), ['start_date', 'end_date', 'country', 'city']) &&
        validInterval(params.start_date, params.end_date) && typeof params.country === 'string' &&
        ['morocco', 'ghana'].includes(params.country) && typeof params.city === 'string'
    );
}

/**
 * Middleware to handle availability query parameters.
 *
 * - Converts the query parameters to lowercase.
 * - Validates the parameters.
 * - Adds 'availability' to the query if valid.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const availabilityQuery = (req: Request, res: Response, next: NextFunction) => {
    const requiredKeys = ['start_date', 'end_date', 'country', 'city'];
    const keys = Object.keys(req.query);
    const isAvailabilityQuery = keys.some((key) => requiredKeys.includes(key));

    if (!isAvailabilityQuery)
        return next();

    if (!isValidValues(req.query))
        return res.status(400).json({
            error: "Invalid query",
            valid_query: "?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&country=MOROCCO(or GHANA)&city=somecity",
        })

    req.query.availability = 'true';
    next();
}

/**
 * Middleware to validate query parameters against allowed keys and values.
 *
 * - Checks if query parameters are valid.
 * - Ensures all values are within allowed options.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const validateQuery = (req: Request, res: Response, next: NextFunction) => {
    if (req.query.availability)
        return next();

    const allowedKeys = {
        deleted: ['true', 'false'],
        role: ['owner', 'sitter', 'admin']
    };

    const invalidKeys = Object.keys(req.query).filter(key => !(key in allowedKeys));

    if (invalidKeys.length > 0) {
        return res.status(400).json({
            error: `Invalid query parameters: ${invalidKeys.join(', ')}`,
            allowed: Object.keys(allowedKeys).join(', ')
        });
    }

    for (const [key, value] of Object.entries(req.query)) {
        const allowedValues = allowedKeys[key as keyof typeof allowedKeys];
        if (allowedValues && !allowedValues.includes(value as string)) {
            return res.status(400).json({
                error: `Invalid value for parameter ${key}=${value}`,
                allowed: `${key}=${allowedValues.join(' or ')}`
            });
        }
    }
    next();
};

/**
 * Middleware to normalize query parameters by converting keys and values to lowercase.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const normalizeQueryParams = (req: Request, res: Response, next: NextFunction) => {
    req.query = Object.keys(req.query).reduce((acc, key) => {
        const value = req.query[key];
        if (Array.isArray(value)) {
            acc[key.toLowerCase()] = value.map(v => typeof v === 'string' ? v.toLowerCase() : v);
        } else {
            acc[key.toLowerCase()] = typeof value === 'string' ? value.toLowerCase() : value;
        }
        return acc;
    }, {} as { [key: string]: any });
    next();
};

/**
 * Middleware to ensure the content type of the request is JSON.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const ensureJsonContentType = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers['content-type'] !== 'application/json')
        return res.status(415).json({error: 'Unsupported Media Type. Please send JSON data.json.'});

    if (Array.isArray(req.body))
        return res.status(400).json({error: 'Only objects can be passed'});

    next();
};

/**
 * Middleware to validate query parameters for login and registration endpoints.
 *
 * - Ensures only 'login' or 'register' is used as a query parameter.
 * - Validates the presence of required data for login.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const loginRegister = (req: Request, res: Response, next: NextFunction) => {
    const allowedKeys = ['login', 'register'];
    const key = Object.keys(req.query).map((key) => key.toLowerCase());

    if (key.length > 1 || !allowedKeys.includes(key[0]))
        return res.status(400).json({
            error: 'Invalid query parameters.',
            allowed: '?login or ?register'
        });

    if (key[0] === 'login') {
        if (!matchingParams(Object.keys(req.body), ['email', 'password']))
            return res.status(400).json({
                error: 'Missing required data for login',
                required: 'email and password'
            });
    }
    next();
};

/**
 * Middleware to handle booking query parameters.
 *
 * - Validates that only one of the allowed status values is provided in the query.
 * - Maps the query key to uppercase and assigns it to the `status` property in the query object.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const bookingQuery = (req: Request, res: Response, next: NextFunction) => {
    const allowedKeys = ['ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'];
    const key = Object.keys(req.query).map((key) => key.toUpperCase());

    if (key.length > 1 || !allowedKeys.includes(key[0]))
        return res.status(400).json({
            error: 'Invalid query parameters.',
            allowed: '?accepted, ?rejected, ?cancelled or ?completed'
        });
    req.query.status = key[0];
    next();
};

/**
 * Configures storage for uploaded files using multer.
 *
 * - Sets the destination directory for uploaded files.
 * - Creates a unique filename based on the current timestamp and user/pet IDs.
 *
 * @constant {multer.StorageEngine}
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Specify the destination directory for uploads
        cb(null, uploads);
    },
    filename: (req, file, cb) => {
        // Create a unique suffix based on timestamp and IDs
        let uniqueSuffix = Date.now() + '__User__' + req.params.user_id;
        if (req.params.pet_id)
            uniqueSuffix += '__Pet__' + req.params.pet_id;
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

/**
 * Middleware for handling file uploads.
 *
 * - Configures storage with specified limits and filters.
 * - Ensures only files with specific extensions are accepted.
 *
 * @constant {multer.Multer}
 */
export const upload = multer({
    storage: storage, // Use the defined storage configuration
    limits: {fileSize: (1024 ** 2) * 3}, // Set file size limit to 1GB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname)
            return cb(null, true); // Accept file if type and extension are valid

        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only .png, .jpg, and .jpeg formats allowed!'));
    }
});