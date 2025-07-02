const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = 'Internal Server Error';
  let stack = null;
  let errors = null;

  // 1. Handle custom ApiError
  if (err instanceof ApiError) {
    message = err.message;
    errors = err.errors;
  }
  
  // 2. Handle Sequelize validation errors
  else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }
  
  // 3. Handle Sequelize unique constraint error
  else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Duplicate Entry Error';
    errors = err.errors.map(e => ({
      field: e.path,
      message: `${e.path} already exists`
    }));
  }
  
  // 4. Handle Sequelize database errors
  else if (err.name === 'SequelizeDatabaseError') {
    statusCode = 400;
    message = 'Database Error';
  }
  
  // 5. Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  
  // 6. Handle MySQL duplicate entry
  else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate entry detected';
    
    // Ekstrak field yang duplicate
    const match = err.sqlMessage.match(/for key '(.+)'/);
    if (match) {
      errors = [{
        field: match[1].replace(/_UNIQUE$/, ''),
        message: 'Value already exists'
      }];
    }
  }

  // 7. Handle foreign key constraint failure
  else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Related resource not found';
  }

  // 8. Handle request validation errors
  else if (err.isJoi) {
    statusCode = 422;
    message = 'Validation Error';
    errors = err.details.map(detail => ({
      field: detail.context.key,
      message: detail.message.replace(/"/g, '')
    }));
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors
    });
  }

  // Logging
  if (process.env.NODE_ENV === 'development') {
    stack = err.stack;
    
    console.error(`[${new Date().toISOString()}] ${statusCode} ${req.method} ${req.path}`);
    console.error('Error:', {
      message: err.message,
      name: err.name,
      stack: err.stack
    });
  } else {
    // Production logging
    // logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  }

  // Response format
  const response = {
    status: 'error',
    statusCode,
    message,
    ...(errors && { errors }), // Tambahkan detail errors jika ada
    ...(process.env.NODE_ENV === 'development' && { stack }) // Hanya di development
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;