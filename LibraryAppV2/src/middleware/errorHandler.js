"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
// Error Handler Middleware
const errorHandler = (err, req, res) => {
    if (!res.status) {
        console.error("res.status is not a function", res);
    }
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    const errorDetails = process.env.NODE_ENV === 'development' ? err.stack : undefined;

    res.status(status).json({
        status,
        message,
        error: errorDetails,
    });
};


exports.errorHandler = errorHandler;
