// Util imports
import catchAsync from '../utlis/catchAsync';
import AppError from '../utlis/appError';
import { resSuccess } from '../utlis/jSend';
import { filterObj, generateToken, isEmpty } from '../utlis/helperFunctions';
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
  const user = await User.findOne({ username: req.params.id });
  if (isEmpty(user)) {
    return next(new AppError('No user found with that ID', 404));
  }
  // If user is found then send the details to client
  return resSuccess(res, user);
});

// Individual users
export const updateProfile = catchAsync(async (req, res, next) => {
  // If user tries to update password the nthrow error
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Cannot update password on this route. Please use "updatePassword" option',
        400,
      ),
    );
  }
  // If file was provided in the request
  if (req.file) {
    // In that case get image url of s3 bucket object
    req.body.profilePhoto = await req.user.getProfilePhoto(req.file, next);
  }
  const filteredBody = filterObj(req.body, ['username', 'name', 'bio', 'phone', 'email', 'profilePhoto']);
  // Update user document
  const updatedData = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  return resSuccess(res, updatedData);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  // Get user from req
  const user = await User.findById(req.user.id).select('+password');
  // Check if 'passwordCurrent' is equal to current password
  if (!req.body.passwordCurrent) {
    return next(new AppError('Current password is required', 400));
  }
  if (
    !(await user.getHashedPassword(req.body.passwordCurrent, user.password))
  ) {
    return next(new AppError('Your current password is incorrect', 401));
  }
  // Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // Save the user
  await user.save();

  // Generate token
  // eslint-disable-next-line no-underscore-dangle
  const token = generateToken(res, user._id);
  // Send the updated token back to client
  return resSuccess(res, { token });
});

// eslint-disable-next-line no-unused-vars
export const deleteAccount = catchAsync(async (req, res, next) => {
  // Delete user by getting id from the logged in request
  await User.findByIdAndDelete(req.user.id);
  resSuccess(res, null, 204);
});
