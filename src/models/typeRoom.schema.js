import mongoose from 'mongoose';

const typeRoomSchema = new mongoose.Schema({
    Description: {
        type: String,
        required: true
    },
    Typename: {
        type: String,
        required: true
    },
    Limit: {
        type: Number,
        required: true
    }
});

export default mongoose.model('TypeRoom', typeRoomSchema);
