import express from 'express';

const app = express();

app.listen(3000, () => {
  console.log('Server is live and listening on : 3000');
});

export default app;
