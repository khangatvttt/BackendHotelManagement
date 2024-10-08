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
    userInfoID: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    gender: {
        type: String
    },
    birthDate: {
        type: Date
    },
    phoneNumber: {
        type: String
    },
    status: {
        type: Number,
        enum: [0, 1],
        default: 1
    }
}, options);

// Create the base User model
const User = mongoose.model('User', userSchema);

// Discriminator for Customer
const Customer = User.discriminator('Customer', new Schema({
    point: { type: Number, default: 0 }
}));

// Discriminator for Staff
const Staff = User.discriminator('Staff', new Schema({
    salary: { type: Number, default: null }
}));

export { User, Customer, Staff };
