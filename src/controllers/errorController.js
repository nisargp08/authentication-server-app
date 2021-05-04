// Util imports
import { resError } from '../utlis/jSend';

// Global error handler
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-param-reassign
  err.statusCode = err.statusCode || 500;
  // eslint-disable-next-line no-param-reassign
  err.status = err.status || 'error';
  // Return jSend error object to client with error details
  resError(res, err);
};

export default errorHandler;
