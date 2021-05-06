/* eslint-disable no-underscore-dangle */
// Util imports
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { resSuccess } from '../utlis/jSend';
import catchAsync from '../utlis/catchAsync';
import AppError from '../utlis/appError';
import sendEmail from '../utlis/emailHandler';
// Model imports
import User from '../models/userModel';

require('dotenv').config();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN,
});
// eslint-disable-next-line no-unused-vars
export const signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  // Generate a JWT and assign it to user document
  // const token = generateToken(user._id);
  // Send successfull response to client returning the details of created user with JWT
  resSuccess(res, user, 201);
});

export const login = catchAsync(async (req, res, next) => {
  // Get credentials from request
  const { userId } = req.body;
  const { password } = req.body;
  // Check if email and password is provided
  if (!userId || !password) {
    return next(new AppError('Username/Password is required', 400));
  }
  // Check if user exists with matching pass
  const user = await User.findOne({
    $or: [
      { email: userId },
      { username: userId },
    ],
  }).select('+password');

  // If no user found or incorrect password then return error
  if (!user || !(await user.getHashedPassword(password, user.password))) {
    return next(new AppError('Invalid Username/Password', 401));
  }

  const token = generateToken(user._id);
  return resSuccess(res, { user, token });
});

export const protect = catchAsync(async (req, res, next) => {
  // 1.Get token from query parameter
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // eslint-disable-next-line prefer-destructuring
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not logged in, Please log in to get access', 401));
  }

  // 2.Verify jwt legit or not
  const decodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3.Check if user still exists
  const user = await User.findById(decodedToken.id);
  if (!user) {
    return next(new AppError('The user belonging to the token no longer exists', 401));
  }

  // 4.Check if password was changed after/before the token was issued
  if (user.afterPasswordChange(decodedToken.iat)) {
    // Password was changed after the token issue date
    return next(new AppError('Password was recently changed! Please log in again', 401));
  }

  // Grant access to protected route
  req.user = user;
  return next();
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  // Find the provided email from the database
  const user = await User.findOne({ email: req.body.email });
  // If user not found
  if (!user) {
    return next(new AppError(`No user found matching email(${req.body.email})`, 404));
  }
  // generate a password reset token
  const resetToken = await user.generateResetToken();
  // Save the encrypted token in db and disable required validation
  await user.save({ validateBeforeSave: false });

  const resetLink = `${req.protocol}://${req.get('host')}${req.baseUrl}/resetPassword/${resetToken}`;
  // Email the plain reset token to user in email
  await sendEmail({
    to: user.email,
    subject: 'Reset your NP Authentication app password',
    text: `
      Hi ${user.username},
      We received a request to reset your NP Authentication app password.
      Link : ${resetLink}
    `,
  });
  // Send back a sucess response
  return resSuccess(res, { message: 'Password reset email has been successfully sent. Valid for next 10 minutes' });
});
