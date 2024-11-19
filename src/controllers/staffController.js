import ForbiddenError from '../errors/forbiddenError.js';
import { Staff, User } from '../models/user.schema.js';
import { ROLES } from '../models/roles.js';
import NotFoundError from '../errors/badRequestError.js';
import BadRequestError from '../errors/badRequestError.js';
import Joi from 'joi'

export const getAllStaffs = async (req, res, next) => {
  try {
    const querySchema = Joi.object({
      phone: Joi.string().optional(),
      email: Joi.string().email().optional(),
      fullName: Joi.string().optional(),
      gender: Joi.string().valid('Male', 'Female').optional(),
      status: Joi.boolean().optional(),
      page: Joi.number().integer().min(1).required(),
      size: Joi.number().integer().min(1).required()
    })

    const { error } = querySchema.validate(req.query)
    if (error) {
      throw error;
    }

    const { phone, email, fullName, gender, status, page } = req.query;
    let { size } = req.query;

    const query = {};
    if (phone) query.phoneNumber = phone;
    if (email) query.email = email;
    if (fullName) query.fullName = { $regex: fullName, $options: 'i' };
    if (gender) query.gender = gender;
    if (status) query.status = status === 'true';

    // Limit size to a max of 10 to avoid large data queries
    if (size > 10) {
      size = 10;
    }

    const totalDocuments = await Staff.countDocuments(query);
    if (totalDocuments==0){
      res.status(200).json({
        "metadata": {
          "currentPage": 0,
          "sizeEachPage": 0,
          "totalElements": 0,
          "totalPages": 0
        },
        "data": [
        ]
      })
      return
    }
    const totalPages = Math.ceil(totalDocuments / size);
    if (page > totalPages) {
      throw new BadRequestError('Excess page limit');
    }

    const users = await Staff.find(query).limit(size).skip(size * (page - 1));
    res.status(200).json({
      metadata: {
        currentPage: parseInt(page),
        sizeEachPage: parseInt(size),
        totalElements: totalDocuments,
        totalPages: totalPages
      },
      data: users
    });
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

    const editableFields = ['password', 'fullName', 'gender', 'birthDate', 'phoneNumber',];

    if (req.user.role == ROLES.ADMIN) {
      editableFields.push('salary','email','status');
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
