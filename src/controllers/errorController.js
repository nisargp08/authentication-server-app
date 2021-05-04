// Global error handler

// Util imports
import AppError from '../utlis/appError';
import { resError } from '../utlis/jSend';

// Error types
const handleCastError = (err) => new AppError(`Invalid ${err.path} : ${err.value} does not exist`, 400);
const handleDuplicateError = (err) => {
  const messages = [];
  Object.keys(err.keyValue).forEach((key) => {
    messages.push(`${key} '${err.keyValue[key]}' already exists`);
  });
  return new AppError(messages, 400);
};
const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((item) => item.message);
  return new AppError(messages, 400);
};
// Error based on environment
const devError = (res, err) => {
  // Send a detailed response when in dev
  resError(res, err, 'dev');
};

const prodError = (res, err) => {
  // When error is operational we know that error is from our app
  if (err.isOperational) {
    // Return jSend error object to client with only required error details
    resError(res, err);
  } else {
  // When error is from third party packages and other network error
  // This is to avoid leaking any error details like paths,field names, value ...
    const errObj = {
      statusCode: 500,
      status: 'error',
      message: 'Unknown error occured',
    };
    resError(res, errObj);
  }
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-param-reassign
  err.statusCode = err.statusCode || 500;
  // eslint-disable-next-line no-param-reassign
  err.status = err.status || 'error';
  // Send response based on the application environment
  if (process.env.NODE_ENV === 'development') {
    devError(res, err);
  } else if (process.env.NODE_ENV === 'production') {
    let error = JSON.parse(JSON.stringify(err));
    // Mongo and mongoose errors
    if (error.name === 'CastError') {
      error = handleCastError(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateError(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    prodError(res, error);
  }
};

export default errorHandler;
