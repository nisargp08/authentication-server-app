import jwt from 'jsonwebtoken';

require('dotenv').config();
// Function to check if array is empty or not
// eslint-disable-next-line import/prefer-default-export
export const isEmpty = (arr) => {
  if (!arr || arr.length <= 0) {
    return true;
  }
  return false;
};

// Function to create a JSON Web token for auth purposes
// And a create a cookie
export const generateToken = (res, id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  // Cookie options
  // Cookie expires in 90days
  const cookieExpiry = new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 1000 * 60 * 60 * 24,
  );
  const cookieOptions = {
    expires: cookieExpiry,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  // Attach cookie to responseo
  res.cookie('jwt', token, cookieOptions);
  // Return token
  return token;
};

// Function to return only passed in fields from the entire object
export const filterObj = (body, fieldsArr) => {
  const filteredBody = {};
  if (body && fieldsArr) {
    Object.keys(body).forEach((key) => {
      if (fieldsArr.includes(key)) {
        filteredBody[key] = body[key];
      }
    });
  }
  return filteredBody;
};
