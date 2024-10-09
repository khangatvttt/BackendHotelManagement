import { User, Customer, Staff } from '../models/user.schema.js';

// Create a new user (Customer or Staff)
export const createUser = async (req, res, next) => {
  try {
    const { role, ...userData } = req.body;
    const newUser = role === 'Customer' ? new Customer(userData) : new Staff(userData);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

// Read all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Update user by ID
export const updateUser = async (req, res, next) => {
    const { id } = req.params; // Extract user ID from request parameters
    const updates = req.body;  // Extract updates from request body
  
    try {
      // Find the user by ID and update
      const updatedUser = await User.findByIdAndUpdate(id, updates, {
        new: true,  
        runValidators: true,
      });
  
      if (!updatedUser) {
        throw new NotFoundError(`User with id ${id} doesn't exist`);
      }
  
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  };

// Delete user by ID
export const deleteUser = async (req, res, next) => {
    const { id } = req.params; // Extract user ID from request parameters
  
    try {
      const deletedUser = await User.findByIdAndDelete(id);
  
      if (!deletedUser) {
        throw new NotFoundError(`User with id ${typeRoom} doesn't exist`);

      }
  
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };


