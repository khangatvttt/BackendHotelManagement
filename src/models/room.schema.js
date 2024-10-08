import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    RoomNumber: {
        type: String,
        required: true,
        unique: true
    },
    TypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TypeRoom',
        required: true
    },
    Description: {
        type: String
    },
    Status: {
        type: Boolean,
        default: true
    },
    Images: {
        type: [String]
    },
    Price: {
        type: Number,
        required: true
    }
});

export default mongoose.model('Room', roomSchema);
