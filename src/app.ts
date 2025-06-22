import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import identifyRouter from './routes/identify.route';
const app = express();

app.use(express.json());

app.use('/identify', identifyRouter);

app.use(errorHandler);

export default app;
