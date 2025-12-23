import express, { Express } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import errorHandler from './middleware/errorMiddleware';
import rateLimiterMiddleware from './middleware/rateLimiterMiddleware';
import colors from 'colors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes';
import cardRoutes from './routes/cardRoutes';
import supplierRoutes from './routes/supplierRoutes';
import settingsRoutes from './routes/settingsRoutes';
import cors from 'cors';
import './types/global';

dotenv.config();

const port = process.env.PORT || 5000;

const app: Express = express();

connectDB();

console.log(process.env.HOST_ADDRESS);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(errorHandler);
app.use(rateLimiterMiddleware);
app.use(cookieParser());
app.use(
	cors({
		origin: process.env.HOST_ADDRESS,
		credentials: true,
	})
);

app.listen(port, () => {
	console.log(colors.green.underline(`Server running on port ${port}`));
});

// Routes
app.use('/api/user', userRoutes);
app.use('/api/card', cardRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/settings', settingsRoutes);

app.use(errorHandler);
