import express from 'express';
import { json, urlencoded } from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import compression from 'compression';
// Initialize express app
const app = express();

// Middlewares
app.use(cors());
app.use(compression({ level: 6 }));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan('dev'));

// Route
app.get('/', (req, res) => {
  res.json('Welcome to the api server');
});

app.listen(5000, () => {
  console.log('Server is live and listening on : 5000');
});
