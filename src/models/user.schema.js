import mongoose from 'mongoose';

const { Schema } = mongoose;

// Base user schema options
const options = { discriminatorKey: 'role', collection: 'users' };

// Base User schema
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
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
    phoneNumber: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
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

// Create the base User model
export const User = mongoose.model('User', userSchema);

// Discriminator for Customer
export const Customer = User.discriminator('Customer', new Schema({
    point: { type: Number, default: 0 }
}));

// Discriminator for Staff
export const Staff = User.discriminator('Staff', new Schema({
    salary: { type: Number, default: null }
}));

export const Admin = User.discriminator('Admin', new mongoose.Schema({}, { _id: false }));



export default { User, Customer, Staff, Admin };
