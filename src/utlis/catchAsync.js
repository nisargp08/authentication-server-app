// This HOF takes in an async function as an argument
const catchAsync = (asyncFunc) => (req, res, next) => {
  asyncFunc(req, res, next).catch((err) => next(err));
};

export default catchAsync;
