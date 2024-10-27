import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    bookingID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    score: {
        type: Number,
        min: 1,
        max: 5,
        default: 1
    },
    feedback: {
        type: String,
    },
    createAt: {
        type: Date,
        required: true
    },
});

export default mongoose.model('Rating', ratingSchema);
