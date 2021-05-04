export const resSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    status: 'success',
    data,
  });
};
// Parameter 'dev' to get a more detailed error response and empty by default
export const resError = (res, err, mode = '') => {
  const errObj = {
    status: err.status,
    message: err.errorMessage,
  };
  if (mode === 'dev') {
    res.status(err.statusCode).json({
      ...errObj,
      error: err,
      stack: err.stack,
    });
  } else {
    // Log the error
    console.log(err);
    // Send the error
    res.status(err.statusCode).json({
      ...errObj,
    });
  }
};
