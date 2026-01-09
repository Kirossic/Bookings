class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

// Middleware для обработки ошибок
const errorHandler = (error, req, res, next) => {
  console.error(error);

  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';
  res.status(status).json({
    error: message,
    status: status,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  ApiError,
  errorHandler
};