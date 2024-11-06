import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const typeRoomSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    typename: {
        type: String,
        required: true
    },
    limit: {
        type: Number,
        required: true
    },
    price: {
        type: new Schema({
            hourlyRate: Number,
            dailyRate: Number
        }, { _id: false }),
        required: true
    },
    images: {
        type: [String]
    }
});

export default mongoose.model('TypeRoom', typeRoomSchema);
