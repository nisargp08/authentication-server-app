import mongoose from 'mongoose';
import isEmail from 'validator/lib/isEmail';
import isAlphaNumeric from 'validator/lib/isAlphanumeric';
import bcrypt from 'bcrypt';

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
});

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
// User model creation
const User = mongoose.model('User', userSchema);

export default User;
