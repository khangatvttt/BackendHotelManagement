import mongoose from 'mongoose';

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
    }
});

export default mongoose.model('TypeRoom', typeRoomSchema);
