import ForbiddenError from '../errors/forbiddenError.js';
import { Staff, User } from '../models/user.schema.js';
import { ROLES } from '../models/roles.js';
import NotFoundError from '../errors/badRequestError.js';

export const getAllStaffs = async (req, res, next) => {
  try {
    const { phone, email, fullName, gender, status } = req.query;

    const query = {};
    if (phone) query.phoneNumber = phone;
    if (email) query.email = email;
    if (fullName) query.fullName = { $regex: fullName, $options: 'i' };
    if (gender) query.gender = gender;
    if (status) query.status = status === 'true';

    const users = await Staff.find(query);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    checkPermisson(req.user, id);
    const user = await Staff.findOne({ _id: id });
    if (!user) {
      throw new NotFoundError(`Staff with ${id} doesn't exist`)
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params; // Extract user ID from request parameters
    let updates = req.body;  // Extract updates from request body

    checkPermisson(req.user, id);

    const editableFields = ['password', 'fullName', 'gender', 'birthDate', 'phoneNumber'];

    if (req.user.role == ROLES.ADMIN){
      editableFields.push('salary');
    }

    // Filter updates to only include editable fields
    updates = Object.keys(updates)
      .filter(key => editableFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const updatedUser = await Staff.findOneAndUpdate({
      role: { $in: [ROLES.STAFF] }, _id: id
    },
      updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new NotFoundError(`Staff with id ${id} doesn't exist`);
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};


const checkPermisson = (currentUser, resourceOwnerId) => {
  const role = currentUser.role
  const id = currentUser.id
  console.log(role, id)
  // Not a admin nor resourceOwner
  if (role != ROLES.ADMIN && id != resourceOwnerId) {
    throw new ForbiddenError('You are not allowed to do this action')
  }
}
