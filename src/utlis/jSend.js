export const resSuccess = (res, statusCode, data) => {
  res.status(statusCode).json({
    status: 'success',
    data,
  });
};

export const resError = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
