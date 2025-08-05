import express from 'express';
import apiRouter from './routes';

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Use the API router
app.use('/', apiRouter);

// Basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export { app, server };
