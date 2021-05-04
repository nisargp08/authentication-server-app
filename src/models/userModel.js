import mongoose from 'mongoose';

// Sets 'required' validation message
const setRequiredMessage = (field) => `${field} is required`;
const setExistsMessage = (field) => `${field} is taken`;
const minLengthMessage = (field, char) => `${field} must be of ${char} or more characters`;

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
  },
  name: {
    type: String,
    required: [true, setRequiredMessage('Name')],
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
userSchema.pre('save', function passwordConfirm(next) {
  // Delete 'passwordConfirm' field
  this.passwordConfirm = undefined;
  next();
});
// User model creation
const User = mongoose.model('User', userSchema);

export default User;
