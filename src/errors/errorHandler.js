export const errorHandler = (err, req, res, next) => {
    // Default status code to 500 (internal server error)
    let statusCode = err.statusCode || 500;
    let message = err.message;

    // Handle Not Found error
    if (err.name === 'Not Found') {
        statusCode = 404;
        message = err.message;
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((error) => error.message).join(', ');
    }

    // Handle invalid ObjectId (CastError)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Handle duplicate key errors (e.g., unique constraint violations)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate value for field '${field}'`;
    }

    // Handle other types of errors (if any)
    res.status(statusCode).json({
        success: false,
        message: message,
    });
};
