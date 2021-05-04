class AppError extends Error {
  constructor(message, statusCode) {
    // To call parent constructor with the message
    super(message);
    // Explicitly assigning message property as the inherited 'message' property
    // get's lost when deepcloning
    this.errorMessage = message;

    this.statusCode = statusCode;
    // Status can be either 'fail' or 'error'
    // Set status to 'fail' if status code starts with 4
    this.status = statusCode.toString().startsWith('4') ? 'fail' : 'error';
    // Mark errors from this class as operational - meaning : generated from the app
    // and not developer error
    this.isOperational = true;
    // Adding error stack trace for further debugging info
    // Will need to use parent class's functions
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
