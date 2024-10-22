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
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date
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
        token: {
            type: String,
        },
        expires: {
            type: Date,
        },
  },
    refreshToken: {
        type: String
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

export default { User, Customer, Staff };
