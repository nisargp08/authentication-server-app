// Util imports
import catchAsync from '../utlis/catchAsync';
import AppError from '../utlis/appError';
import { resSuccess } from '../utlis/jSend';
import { isEmpty } from '../utlis/helperFunctions';
// Model imports
import User from '../models/userModel';

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
