// Mongodb connection setup
import mongoose from 'mongoose';

require('dotenv').config();

// Set DB url based on app environment
let dbUrl = '';
if (process.env.NODE_ENV === 'production') {
  dbUrl = process.env.PROD_DB_URL;
} else if (process.env.NODE_ENV === 'development') {
  dbUrl = process.env.DEV_DB_URL;
}
const connectDB = (url = dbUrl, opts = {}) => mongoose.connect(url, {
  ...opts,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

export default connectDB;
