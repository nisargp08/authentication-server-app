// Library imports
import express from 'express';
import { json, urlencoded } from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import cookieParser from 'cookie-parser';

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

// 1.Initialize express app
const app = express();

// 2.Middlewares
// For setting security http headers
app.use(helmet());
// For Cross origin resource sharing
app.use(cors());
// Compressing our responses in gzip resulting into smaller response payload
app.use(compression({ level: 6 }));
// Parsing incoming request bodies
app.use(json());
app.use(urlencoded({ extended: true }));
// Limiter to limit number of requests from an IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // So allow only 100 request in one hours from the asme IP
  message: 'Too many service requests from your IP, please try again in an hour!',
});
app.use('/api', limiter);
// Mongo query injection sanitization
app.use(mongoSanitize());
// Xss clean
app.use(xss());
// Parsing cookies in the request
app.use(cookieParser());
// Activity logging for dev environment
app.use(morgan('dev'));

// 3.Routes
app.get('/', (req, res) => {
  res.json('Welcome to the auth api server');
});
app.use('/api/v1', authRouter);
app.use('/api/v1/users', protect, userRouter);
// Default error route
app.all('*', (req, res, next) => {
  next(new AppError(`Unable to find '${req.originalUrl}' on this server`, 404));
});

// 4.Global error handler
app.use(globalErrorHandler);

// 5.Server bootup function
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
