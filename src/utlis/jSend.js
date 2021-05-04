export const resSuccess = (res, statusCode, data) => {
  res.status(statusCode).json({
    status: 'success',
    data,
  });
};
// Parameter 'dev' to get a more detailed error response and empty by default
export const resError = (res, err, mode = '') => {
  const errObj = {
    status: err.status,
    message: err.message,
  };
  if (mode === 'dev') {
    res.status(err.statusCode).json({
      ...errObj,
      error: err,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).json({
      ...errObj,
    });
  }
};
