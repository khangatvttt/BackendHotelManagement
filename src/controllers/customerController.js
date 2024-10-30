import ForbiddenError from '../errors/forbiddenError.js';
import { Customer, OnSiteCustomer, User } from '../models/user.schema.js';
import { ROLES } from '../models/roles.js';
import NotFoundError from '../errors/badRequestError.js';

export const getAllCustomers = async (req, res, next) => {
  try {
    const { phone, email, fullName, gender, status } = req.query;

    const query = {};
    if (phone) query.phoneNumber = phone;
    if (email) query.email = email;
    if (fullName) query.fullName = { $regex: fullName, $options: 'i' };
    if (gender) query.gender = gender;
    if (status) query.status = status === 'true';

    query.role = { $in: [ROLES.CUSTOMER, ROLES.ONSITE_CUSTOMER] }

    const users = await User.find(query);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    checkPermisson(req.user, id);
    const user = await User.findOne({ role: { $in: [ROLES.CUSTOMER, ROLES.ONSITE_CUSTOMER] }, _id: id });
    if (!user) {
      throw new NotFoundError(`Customer with ${id} doesn't exist`)
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params; // Extract user ID from request parameters
    let updates = req.body;  // Extract updates from request body

    checkPermisson(req.user, id);

    const editableFields = ['password', 'fullName', 'gender', 'birthDate', 'phoneNumber'];

    if (req.user.role == ROLES.ADMIN || req.user.role == ROLES.STAFF) {
      editableFields.push('point');
    }

    // Filter updates to only include editable fields
    updates = Object.keys(updates)
      .filter(key => editableFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const updatedUser = await Customer.findOneAndUpdate({ _id: id },
      updates, {
      new: true,
      runValidators: true,
    });


    if (!updatedUser) {
      const updatedOnsiteCustomer = await OnSiteCustomer.findOneAndUpdate({_id: id}, updates, {
        new: true,
        runValidators: true,
      });
      if (!updatedOnsiteCustomer) {
        throw new NotFoundError(`Customer with id ${id} doesn't exist`);
      }
      res.status(200).json(updatedOnsiteCustomer);
    }
    else {
      res.status(200).json(updatedUser);
    }


  } catch (error) {
    next(error);
  }
};


const checkPermisson = (currentUser, resourceOwnerId) => {
  const role = currentUser.role
  const id = currentUser.id
  // Not a admin nor staff nor resourceOwner
  if (role != ROLES.ADMIN && role != ROLES.STAFF && id != resourceOwnerId) {
    throw new ForbiddenError('You are not allowed to do this action')
  }
}