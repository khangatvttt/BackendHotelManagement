import mongoose from 'mongoose';

const maintainScheduleSchema = new mongoose.Schema({
    RoomID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    ScheduleDate: {
        type: Date,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    Price: {
        type: Number,
        required: true
    },
    Status: {
        type: Boolean,
        default: true
    }
});

export default mongoose.model('MaintainSchedule', maintainScheduleSchema);
