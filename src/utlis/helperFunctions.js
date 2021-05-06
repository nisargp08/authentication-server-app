import jwt from 'jsonwebtoken';

// Function to check if array is empty or not
// eslint-disable-next-line import/prefer-default-export
export const isEmpty = (arr) => {
  if (!arr || arr.length <= 0) {
    return true;
  }
  return false;
};

// Function to create a JSON Web token for auth purposes
export const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN,
});
