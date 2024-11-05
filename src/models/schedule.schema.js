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
    shifts: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Shift',
        required: true

    }
});

export default mongoose.model('Schedule', scheduleSchema);
