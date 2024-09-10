import {EntityPropertyNotFoundError} from "typeorm";
import {AppError} from "../errors/Errors";
import {NextFunction, Request, Response} from "express";

export const validateBody = (body: object) => {
    return Object.fromEntries(
        Object.entries(body).map(([key, value]) =>
            [key.toLowerCase(), value]
        ));
}

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

const matchingParams = (keys: string[], requiredKeys: string[]) => {
    keys = keys.map(key => key.toLowerCase());

    return (
        requiredKeys.length === keys.length &&
        keys.every((key) => requiredKeys.includes(key))
    );
}

const isValidDate = (date: Date | string): Date | null => {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

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


const isValidValues = (params : object) => {
    return (
        matchingParams(Object.keys(params), ['start_date', 'end_date', 'country', 'city']) &&
        // @ts-ignore
        validInterval(params.start_date, params.end_date) && typeof params.country === 'string' &&
        // @ts-ignore
        ['morocco', 'ghana'].includes(params.country) && typeof params.city === 'string'
    );
}

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

export const ensureJsonContentType = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers['content-type'] !== 'application/json')
        return res.status(415).json({error: 'Unsupported Media Type. Please send JSON data.json.'});

    if (Array.isArray(req.body))
        return res.status(400).json({error: 'Only objects can be passed'});

    next();
};

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

export const bookingQuery = (req: Request, res: Response, next: NextFunction) => {
    const allowedKeys = ['ACCEPTED', 'REJECTED', 'CANCELLED'];
    const key = Object.keys(req.query).map((key) => key.toUpperCase());

    if (key.length > 1 || !allowedKeys.includes(key[0]))
        return res.status(400).json({
            error: 'Invalid query parameters.',
            allowed: '?accepted, ?rejected or ?cancelled'
        });
    req.query.status = key[0];
    next();
};