import express from 'express';
import connectDB from './src/config/databaseConfig.js';
import userRoutes from './src/routes/userRoutes.js';
import typeRoomRoutes from './src/routes/typeRoomRoutes.js'
import roomRoutes from './src/routes/roomRoutes.js'
import bookingRoutes from './src/routes/bookingRoutes.js'
import promotionRoutes from './src/routes/promotionRoutes.js'
import maintainScheduleRoutes from './src/routes/maintainScheduleRoutes.js'
import { errorHandler } from './src/errors/errorHandler.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // For parsing application/json

// Database connection
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/type-rooms', typeRoomRoutes);
app.use('/api/rooms', roomRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/promotions', promotionRoutes)
app.use('/api/maintain-schedules', maintainScheduleRoutes)


app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
