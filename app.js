import express, { json } from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = 3000;

app.use(json());

// Test route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
// import mongoose from 'mongoose';
// import { Customer, Staff } from './src/models/user.schema.js';
// import dotenv from 'dotenv';

// dotenv.config();

// // Connect to MongoDB
// mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // Create a new customer
// const createCustomer = async () => {
//   const newCustomer = new Customer({
//     email: 'customer@example.com',
//     password: 'securepassword',
//     userInfoID: '12345',
//     fullName: 'John Doe',
//     gender: 'Male',
//     birthDate: new Date('1990-01-01'),
//     phoneNumber: '123-456-7890',
//     point: 150  // Points specific to customers
//   });

//   await newCustomer.save();
//   console.log('Customer created:', newCustomer);
// };

// // Create a new staff
// const createStaff = async () => {
//   const newStaff = new Staff({
//     email: 'staff@example.com',
//     password: 'anothersecurepassword',
//     userInfoID: '67890',
//     fullName: 'Jane Smith',
//     gender: 'Female',
//     birthDate: new Date('1985-05-15'),
//     phoneNumber: '987-654-3210',
//     salary: 50000  // Salary specific to staff
//   });

//   await newStaff.save();
//   console.log('Staff created:', newStaff);
// };

// // Query example
// const findAllUsers = async () => {
//   const users = await mongoose.model('User').find();  // Fetch all users (Customer & Staff)
//   console.log('All users:', users);
// };

// // Example function calls
// createCustomer();
// createStaff();
// findAllUsers();
