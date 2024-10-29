import mongoose from 'mongoose';

const overOccupancyCharge = new mongoose.Schema({
    excessGuests: {
        type: Number,
        unique: true,
        required: true
    },
    extraCharge: {
        type: Number,
        required: true
    }
});

export default mongoose.model('OverOccupancyCharge', overOccupancyCharge);
