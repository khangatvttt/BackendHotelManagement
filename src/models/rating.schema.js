import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    typeRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TypeRoom',
        required: true
    },
    score: {
        type: Number,
        min: 1,
        max: 5,
        default: 1,
        validate: {
            // Only allow integer or half-integer
            validator: function(value) {
              return Number.isInteger(value * 2);
            },
            message: props => `${props.value} is not a valid rating score!`
          }
    },
    feedback: {
        type: String,
    },
    createAt: {
        type: Date,
        default: Date.now()
    },
});

ratingSchema.index({ bookingId: 1, typeRoomId: 2}, { unique: true })

export default mongoose.model('Rating', ratingSchema);
