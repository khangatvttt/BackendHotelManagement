import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true
    },
    typeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TypeRoom',
        required: true
    },
    description: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    }
});

export default mongoose.model('Room', roomSchema);
