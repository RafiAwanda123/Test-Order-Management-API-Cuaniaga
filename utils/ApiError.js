class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    
    Error.captureStackTrace(this, this.constructor);
  }
  
  static badRequest(message, errors) {
    return new ApiError(400, message || 'Bad Request', errors);
  }
  
  static unauthorized(message) {
    return new ApiError(401, message || 'Unauthorized');
  }
  
  static forbidden(message) {
    return new ApiError(403, message || 'Forbidden');
  }
  
  static notFound(message) {
    return new ApiError(404, message || 'Not Found');
  }
  
  static conflict(message, errors) {
    return new ApiError(409, message || 'Conflict', errors);
  }
  
  static internal(message) {
    return new ApiError(500, message || 'Internal Server Error');
  }
}

module.exports = ApiError;