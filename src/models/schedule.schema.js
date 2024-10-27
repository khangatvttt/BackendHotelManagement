import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shift: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shift',
        required: true

    }]
});

export default mongoose.model('Schedule', scheduleSchema);
