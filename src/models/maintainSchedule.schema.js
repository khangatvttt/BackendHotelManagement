import mongoose from 'mongoose';

const maintainScheduleSchema = new mongoose.Schema({
    roomID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    scheduleDate: {
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
    status: {
        type: Boolean,
        default: true
    }
});

export default mongoose.model('MaintainSchedule', maintainScheduleSchema);
