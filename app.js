import express from 'express';
import swaggerDocs from './swagger.js'
import connectDB from './src/config/databaseConfig.js';
import userRoutes from './src/routes/userRoutes.js';
import typeRoomRoutes from './src/routes/typeRoomRoutes.js'
import roomRoutes from './src/routes/roomRoutes.js'
import bookingRoutes from './src/routes/bookingRoutes.js'
import promotionRoutes from './src/routes/promotionRoutes.js'
import maintainScheduleRoutes from './src/routes/maintainScheduleRoutes.js'
import authRoutes from './src/routes/authRoutes.js'
import { errorHandler } from './src/errors/errorHandler.js';
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import jwtMiddleware from './src/middlewares/jwtMiddleware.js'


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

// Database connection
connectDB();

// Middleware
app.use(express.json()); // For parsing application/json
app.use(cookieParser()); // For parsing cookie

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Allow cookies to be sent in requests
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed methods
  allowedHeaders: 'Content-Type,Authorization', // Headers that are allowed
}));

// Endpoint doesn't need jwt authentication
app.use('/api/auth', authRoutes)
//API documents
swaggerDocs(app, PORT)


// JWT authentication
app.use(jwtMiddleware)


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
