import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    UserID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    RoomID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    }],
    CreatedAt: {
        type: Date,
        default: Date.now
    },
    CheckInTime: {
        type: Date,
        required: true
    },
    CheckOutTime: {
        type: Date,
        required: true
    },
    Rating: {
        type: Number,
        min: 0,
        max: 5
    },
    personNumber: { //How many people booked this time
        type: Number,
        required: true
    },
    TotalAmount: {
        type: Number,
        required: true
    },
    PaymentMethod: {
        type: String,
        required: true
    },
    CurrentStatus: { //Cancel (true) or still reservation (false)
        type: Boolean,
        required: true
    }
});

export default mongoose.model('Booking', bookingSchema);