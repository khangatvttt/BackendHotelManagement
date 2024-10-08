import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
    UserID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: true
    },
    Shift: [{
        WorkDate: {
            type: Date,
            required: true
        },
        ShiftStart: {
            type: Date,
            required: true
        },
        ShiftEnd: {
            type: Date,
            required: true
        }
    }]
});

export default mongoose.model('Schedule', scheduleSchema);
