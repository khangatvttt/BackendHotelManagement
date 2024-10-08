import { User, Customer, Staff } from '../models/user.schema.js';

// Create a new user (Customer or Staff)
export const createUser = async (req, res) => {
  try {
    const { role, ...userData } = req.body;
    const newUser = role === 'Customer' ? new Customer(userData) : new Staff(userData);
    console.log("a")
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user by ID
export const updateUser = async (req, res) => {
    const { id } = req.params; // Extract user ID from request parameters
    const updates = req.body;  // Extract updates from request body
  
    try {
      // Find the user by ID and update
      const updatedUser = await User.findByIdAndUpdate(id, updates, {
        new: true,  
        runValidators: true,
      });
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// Delete user by ID
export const deleteUser = async (req, res) => {
    const { id } = req.params; // Extract user ID from request parameters
  
    try {
      const deletedUser = await User.findByIdAndDelete(id);
  
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(204).send(); // No content to send back after deletion
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


