/**
 * Centralized Error Handling Middleware
 */
const notFound = (req, res, next) => {
  const error = new Error(`API Route Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Handle Mongoose validation errors cleanly
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join('. '),
    });
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'A record with that unique value already exists.',
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

module.exports = { notFound, errorHandler };
