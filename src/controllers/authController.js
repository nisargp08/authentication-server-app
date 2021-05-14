/* eslint-disable no-underscore-dangle */
// Util imports
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { createHash } from 'crypto';
import { resSuccess } from '../utlis/jSend';
import { generateToken } from '../utlis/helperFunctions';
import catchAsync from '../utlis/catchAsync';
import AppError from '../utlis/appError';
import sendEmail from '../utlis/emailHandler';
// Model imports
import User from '../models/userModel';

require('dotenv').config();

// eslint-disable-next-line no-unused-vars
export const signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
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
    $or: [{ email: userId }, { username: userId }],
  }).select('+password');

  // If no user found or incorrect password then return error
  if (!user || !(await user.getHashedPassword(password, user.password))) {
    return next(new AppError('Invalid Username/Password', 401));
  }

  const token = generateToken(res, user._id);
  // Setting password undefined to leak the password in response even if it is encrypted
  user.password = undefined;
  return resSuccess(res, { user, token });
});

export const protect = catchAsync(async (req, res, next) => {
  // 1.Get token from query parameter
  let token;
  if (
    req.headers.authorization
    && req.headers.authorization.startsWith('Bearer')
  ) {
    // eslint-disable-next-line prefer-destructuring
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return next(
      new AppError('You are not logged in, Please log in to get access', 401),
    );
  }

  // 2.Verify jwt legit or not
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );

  // 3.Check if user still exists
  const user = await User.findById(decodedToken.id);
  if (!user) {
    return next(
      new AppError('The user belonging to the token no longer exists', 401),
    );
  }

  // 4.Check if password was changed after/before the token was issued
  if (user.afterPasswordChange(decodedToken.iat)) {
    // Password was changed after the token issue date
    return next(
      new AppError('Password was recently changed! Please log in again', 401),
    );
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
    return next(
      new AppError(`No user found matching email(${req.body.email})`, 404),
    );
  }
  // generate a password reset token
  const resetToken = await user.generateResetToken();
  // Save the encrypted token in db and disable required validation
  await user.save({ validateBeforeSave: false });

  const resetLink = `${req.protocol}://${req.get('host')}${
    req.baseUrl
  }/resetPassword/${resetToken}`;
  // Email the plain reset token to user in email
  try {
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
    return resSuccess(res, {
      message:
        'Password reset email has been successfully sent. Valid for next 10 minutes',
    });
  } catch (err) {
    // Some error occured while sending email
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    // Return error
    return next(
      new AppError(
        'Error occured while sending email. Please try again later',
        500,
      ),
    );
  }
});

export const checkResetToken = catchAsync(async (req, res, next) => {
// Get token from request parameter
  const { token } = req.params;
  if (!token) {
    return new AppError(
      'Reset link is required in order to change the password',
      400,
    );
  }
  // Encrypt the token
  const passwordResetToken = createHash('sha256').update(token).digest('hex');
  // Find the encrypted token in db
  const user = await User.findOne({ passwordResetToken });
  if (!user) {
    return next(new AppError('Password reset link not found', 404));
  }
  // If a match is found then check the token expiry
  const isExpired = Date.now() > user.passwordResetTokenExpiry;
  if (isExpired) {
    return next(
      new AppError(
        'Password reset link has expired. Issue a new one by using "Forgot Password" feature',
        401,
      ),
    );
  }
  // Send response
  return resSuccess(res, { message: 'Valid link' });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  // Get token from request parameter
  const { token } = req.params;
  if (!token) {
    return new AppError(
      'Reset link is required in order to change the password',
      400,
    );
  }
  // Encrypt the token
  const passwordResetToken = createHash('sha256').update(token).digest('hex');
  // Find the encrypted token in db
  const user = await User.findOne({ passwordResetToken });
  if (!user) {
    return next(new AppError('Password reset link not found', 404));
  }
  // If a match is found then check the token expiry
  const isExpired = Date.now() > user.passwordResetTokenExpiry;
  if (isExpired) {
    return next(
      new AppError(
        'Password reset link has expired. Issue a new one by using "Forgot Password" feature',
        401,
      ),
    );
  }
  // If token is not expired then get password and passwordConfirm from body
  const { password, passwordConfirm } = req.body;
  // Update the password in db
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  // Remove passwordResetToken and passwordResetTokenExpiry
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiry = undefined;
  // Save the user
  await user.save();
  // Send an email confirming user's password has been successfully changed
  await sendEmail({
    to: user.email,
    subject: 'NP Authentication app password update confirmation',
    text: `
    Hi ${user.username},
    Your password has been successfully updated.
  `,
  });
  // Send success response
  return resSuccess(res, { message: 'Password has been successfully changed' });
});

export const getUserByToken = catchAsync(async (req, res, next) => resSuccess(res, req.user));
