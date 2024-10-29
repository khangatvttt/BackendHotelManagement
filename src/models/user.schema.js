import mongoose from 'mongoose';
import { ROLES } from './roles.js';
import bcrypt from 'bcrypt'
import BadRequestError from '../errors/badRequestError.js'

const { Schema } = mongoose;

// Base user schema options
const options = { discriminatorKey: 'role', collection: 'users', retainKeyOrder: true };

// Base User schema
const userSchema = new Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
              return /^\d{10}$/.test(v);
            },
            message: "Invalid phone number. Must have 10 digits"
          }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        sparse: true,
        match: [ /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Invalid email format' ]
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    fullName: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    },
    birthDate: {
        type: Date,
        required: true

    },
    status: {
        type: Boolean,
    },
    isVerified: {
        type: Boolean,
    },
    resetPasswordToken: {
        type: new Schema({
            token: String,
            expires: Date
        }, { _id: false }),
        select: false
    },
    refreshToken: {
        type: String,
        select: false
    }
}, options);

//Hash password before save to database
userSchema.pre("save",function(next){
    if (!this.isModified('password')) {
        return next();
    }
    this.password = bcrypt.hashSync(this.password,10)
    next();
})
userSchema.pre("findOneAndUpdate",function(next){
    const update = this.getUpdate();
    // Check if password is being updated
    if (update.password) {
        // Check if password is strong is enough
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{6,}$/;
        if (!passwordRegex.test(update.password)){
            next(new BadRequestError("Password is not strong is enough. Must have at least at least 6 characters and contains at least 1 Upcase letter, 1 Number and 1 Lowercase letter"))
        }
        // Hash password
        update.password = bcrypt.hashSync(update.password,10)
    }
    next();
})

// Create the base User model
export const User = mongoose.model('User', userSchema);

// Discriminator for Customer
export const Customer = User.discriminator(ROLES.CUSTOMER, new Schema({
    point: { type: Number, default: 0 }
}));

// Discriminator for Staff
export const Staff = User.discriminator(ROLES.STAFF, new Schema({
    salary: { type: Number, default: null }
}));

export const Admin = User.discriminator(ROLES.ADMIN, new mongoose.Schema({}, { _id: false }));

export const OnSiteCustomer = User.discriminator(ROLES.ONSITE_CUSTOMER, new Schema({
    point: { type: Number, default: 0 }
}));




export default { User, Customer, Staff, Admin };
