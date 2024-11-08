import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workDate: {
        type: Date,
        required: true
    },
    shiftId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shift',
        required: true

    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    }
});

scheduleSchema.index({ userId: 1, shiftId: 1, workDate: 1}, { unique: true })


export default mongoose.model('Schedule', scheduleSchema);
