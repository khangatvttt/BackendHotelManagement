import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema({
    shiftName: {
        type: String,
        require: true
    },
    startTime: {
        type: Date,
        require: true
    },
    endTime: {
        type: Date,
        require: true
    }
});

export default mongoose.model('Shift', shiftSchema);
