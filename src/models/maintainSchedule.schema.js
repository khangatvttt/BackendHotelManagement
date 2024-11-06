import mongoose from 'mongoose';

const maintainScheduleSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    maintainDate: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    // False is cancelled
    status: {
        type: Boolean,
        default: true
    }
});

export default mongoose.model('MaintainSchedule', maintainScheduleSchema);
