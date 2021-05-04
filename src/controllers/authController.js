// Util imports
import jwt from 'jsonwebtoken';
import catchAsync from '../utlis/catchAsync';
import { resSuccess } from '../utlis/jSend';
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
  // Generate a JWT and assign it to user document
  // eslint-disable-next-line no-underscore-dangle
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN });
  // Send successfull response to client returning the details of created user with JWT
  resSuccess(res, { user, token }, 201);
});

export const login = (req, res, next) => {
  resSuccess(res, 'Hi', 200);
};
