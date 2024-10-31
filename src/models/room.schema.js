import mongoose from 'mongoose';
import { Schema } from 'mongoose';

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
    },
    images: {
        type: [String]
    },
    price: {
        type: new Schema({
            hourlyRate: Number,
            dailyRate: Number
        }, { _id: false }),
        require: true
    }
});

export default mongoose.model('Room', roomSchema);
