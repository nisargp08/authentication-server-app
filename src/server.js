// Library imports
import express from 'express';
import { json, urlencoded } from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import compression from 'compression';

// Config imports
import connectDB from './config/db';

// Util imports
import AppError from './utlis/appError';

// Controller imports
import { protect } from './controllers/authController';
import globalErrorHandler from './controllers/errorController';

// Router imports
import authRouter from './routes/authRoutes';
import userRouter from './routes/userRoutes';

// Initialize express app
const app = express();

// Middlewares
app.use(cors());
app.use(compression({ level: 6 }));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.json('Welcome to the auth api server');
});
app.use('/api/v1', authRouter);
app.use('/api/v1/users', protect, userRouter);
// Default error route
app.all('*', (req, res, next) => {
  next(new AppError(`Unable to find '${req.originalUrl}' on this server`, 404));
});

// Global error handler
app.use(globalErrorHandler);

// Server bootup function
const startServer = async () => {
  try {
    // Connect to DB
    await connectDB();
    const port = process.env.PORT || 5000;
    const listener = app.listen(port, () => {
      console.log(
        `Server is live and listening on : ${listener.address().port}`,
      );
    });
  } catch (err) {
    console.log('Error connecting to DB');
  }
};

export default startServer;
