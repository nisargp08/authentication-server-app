// Util imports
import catchAsync from '../utlis/catchAsync';
// Model imports
import { resSuccess } from '../utlis/jSend';
import AppError from '../utlis/appError';
import User from '../models/userModel';

// Function to check if array is empty or not
const isEmpty = (arr) => {
  if (arr.length <= 0) {
    return true;
  }
  return false;
};
// eslint-disable-next-line no-unused-vars
export const createUser = catchAsync(async (req, res, next) => {
  const user = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.password,
  });
  // Send successfull response to client returning the details of created user
  resSuccess(res, user, 201);
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({});
  // If no users found send 404
  if (isEmpty(users)) {
    return next(new AppError('No users found', 404));
  }
  // Send successfull response to client returning the details of all users
  return resSuccess(res, users);
});

export const getUserById = catchAsync(async (req, res, next) => {
  // Query db to find the user
  const user = await User.findById(req.params.id);
  if (isEmpty(user)) {
    return next(new AppError('No user found with that ID', 404));
  }
  // If user is found then send the details to client
  return resSuccess(res, user);
});
