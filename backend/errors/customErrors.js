/**
 * Custom Error Classes for Application Services
 */

class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
        this.name = 'BadRequestError';
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 404;
        this.name = 'NotFoundError';
    }
}

class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 401;
        this.name = 'UnauthorizedError';
    }
}

class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 403;
        this.name = 'ForbiddenError';
    }
}

module.exports = {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError
};