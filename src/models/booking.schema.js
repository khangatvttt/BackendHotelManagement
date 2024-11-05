import mongoose from 'mongoose';
const { Schema } = mongoose;

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Room',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    checkInTime: {
        type: Date,
        required: true
    },
    checkOutTime: {
        type: Date,
        required: true
    },

    numberOfGuests: { //How many people booked this time
        type: Number,
        required: true
    },
    paidAmount: {
        type: new Schema({
            amount: Number,
            latestPaidTime: Date
        }, { _id: false }),
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    currentStatus: {
        type: String,
        enum: ['Reserved', 'Cancelled', 'Left'],
        default: 'Reserved'
    }
});


export default mongoose.model('Booking', bookingSchema);
