export const errorHandler = (err, req, res, next) => {
  console.error('[Server Error Handler]:', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409; // Conflict
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `User with this ${field} already exists.`;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Handle Mongoose CastError (invalid ObjectId or field casting)
  if (err.name === 'CastError') {
    if (err.path === '_id') {
      statusCode = 404;
      message = err.value && String(err.value).toLowerCase() === 'all'
        ? 'Government Scheme not found'
        : `Resource not found with id of ${err.value}`;
    } else {
      statusCode = 400;
      message = `Invalid value for field "${err.path}"`;
    }
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
