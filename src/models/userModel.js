// Library imports
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';

// Helper functions and classes import
import isEmail from 'validator/lib/isEmail';
import isAlphaNumeric from 'validator/lib/isAlphanumeric';
import AppError from '../utlis/appError';
import uploadFileToS3 from '../config/aws_s3';

// Sets 'required' validation message
const setRequiredMessage = (field) => `${field} is required`;
const setExistsMessage = (field) => `${field} is taken`;
const minLengthMessage = (field, char) => `${field} must be of ${char} or more characters`;
const setAlphaNumericMessage = (field) => `${field} must only contain alphanumeric characters`;

// User model schema
const userSchema = new mongoose.Schema({
  // username,name,bio,phone,email,password
  username: {
    type: String,
    required: [true, setRequiredMessage('Username')],
    unique: [true, setExistsMessage('Username')],
    trim: true,
    lowercase: true,
    minlength: [3, minLengthMessage('Username', 3)],
    validate: [isAlphaNumeric, setAlphaNumericMessage('Username')],
  },
  name: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  phone: {
    type: Number,
    trim: true,
  },
  email: {
    type: String,
    required: [true, setRequiredMessage('Email')],
    unique: [true, setExistsMessage('Email')],
    trim: true,
    lowercase: true,
    validate: [isEmail, 'Please provide a valid email'],
  },
  profilePhoto: String,
  password: {
    type: String,
    required: [true, setRequiredMessage('Password')],
    minlength: [8, minLengthMessage('Password', 8)],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, setRequiredMessage('Password Confirm')],
    validate: {
      validator(password) {
        return password === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpiry: Date,
}, { timestamps: true });

// Mongoose middlewares
userSchema.pre('save', async function passwordConfirm(next) {
  // Generate name based on the 'username'
  this.name = this.username;

  // Check if password is modifier or not
  if (!this.isModified('password')) return next();
  // Hash passwords before save
  this.password = await bcrypt.hash(this.password, 12);

  // Delete 'passwordConfirm' field
  this.passwordConfirm = undefined;

  return next();
});
userSchema.pre('save', function passwordChangedAt(next) {
  // If password is never changed or password is new(first time created when account setup)
  // Then return to next middleware ; No action needed
  if (!this.isModified('password') || this.isNew) { return next(); }
  // If password is modified - Update the passwordChangedAt field
  this.passwordChangedAt = Date.now();
  return next();
});
// Mongoose instance methods
userSchema.methods.getHashedPassword = async function hashCompare(enteredPassword, actualPassword) {
  // Compares both hash and returns a boolean value
  const result = await bcrypt.compare(enteredPassword, actualPassword);
  return result;
};
userSchema.methods.afterPasswordChange = function afterPasswordChange(tokenTimestamp) {
  // If User has updated the password after initial setup
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    // Password was changed after token initial issue,
    // thus rendering the token invalid for further use
    return (tokenTimestamp < changedTimestamp);
  }
  // Token is valid for use
  return false;
};
userSchema.methods.generateResetToken = async function generateResetToken() {
  // Generate a random hex string
  const resetToken = randomBytes(32).toString('hex');
  // Encrypt it and store it
  this.passwordResetToken = createHash('sha256').update(resetToken).digest('hex');
  // Set token expiry date - 10 Minutes
  this.passwordResetTokenExpiry = Date.now() + 1000 * 60 * 10; // ms * seconds * min = 10minutes
  // Return plain token
  return resetToken;
};
userSchema.methods.getProfilePhoto = async function getProfilePhoto(file, next) {
  // Formatting file name
  // eslint-disable-next-line no-param-reassign
  file.formattedName = `${Date.now().toString()}_${file.originalname.toString().trim().toLowerCase().replace(' ', '_')}`;
  // Validate file type
  if (!file.mimetype.match('image/*')) {
    return next(new AppError('Invalid file type provided. File must be of image type', 400));
  }
  // Upload file to S3 and get only url of the file
  const { Location } = await uploadFileToS3(file);
  // Return file url
  return Location;
};
// User model creation
const User = mongoose.model('User', userSchema);

export default User;
