import ForbiddenError from '../errors/forbiddenError.js';
import { User, Customer, Staff } from '../models/user.schema.js';
import bcrypt from 'bcrypt'
import BadRequestError from '../errors/badRequestError.js'

// Read all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Get info of a user
export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await checkPermisson(req.user, id);
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Update user by ID
export const updateUser = async (req, res, next) => {
  const { id } = req.params; // Extract user ID from request parameters
  let updates = req.body;  // Extract updates from request body

  await checkPermisson(req.user, id);

  const editableFields = ['password', 'fullName', 'gender', 'birthDate', 'phoneNumber'];

  // Filter updates to only include editable fields
  updates = Object.keys(updates)
    .filter(key => editableFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});

  try {
    // If password is updated, hash it before save
    if ('password' in updates) {

      const newPassword = updates.password
      // Check if password is strong enough (at least 6 character, 1 Upcase letter, 1 Number and 1 Lowercase letter)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
      if (!passwordRegex.test(newPassword)) {
        throw new BadRequestError("Password is not strong is enough. Must have at least at least 6 characters and contains at least 1 Upcase letter, 1 Number and 1 Lowercase letter");
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      updates.password = hashedPassword;
    }
    // Find the user by ID and update
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new NotFoundError(`User with id ${id} doesn't exist`);
    }

    res.status(200).send();
  } catch (error) {
    next(error);
  }
};


const checkPermisson = async (currentUserId, resourceOwnerId) => {
  const rolePower = new Map();
  rolePower.set('Admin', 3);
  rolePower.set('Staff', 2);
  rolePower.set('User', 1);
  const currentUser = await User.findById(currentUserId);
  const resourceOwner = await User.findById(resourceOwnerId);
  const currentUserRole = currentUser.role
  const resourceOwnerRole = resourceOwner.role
  if (rolePower.get(currentUserRole)<rolePower(resourceOwnerRole)) {
    throw new ForbiddenError('You are not allowed to do this action')
  }
  if (rolePower.get(currentUserRole)==rolePower(resourceOwnerRole) && currentUserId!=resourceOwnerId){
    throw new ForbiddenError('You are not allowed to do this action')
  }
}
