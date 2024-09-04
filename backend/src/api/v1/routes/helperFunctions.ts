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

export const validateQuery = (req: Request, res: Response, next: NextFunction) => {
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