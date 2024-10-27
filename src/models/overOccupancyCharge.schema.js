import mongoose from 'mongoose';

const overOccupancyCharge = new mongoose.Schema({
    excessGuests: {
        type: Number,
        required: true
    },
    extraCharge: {
        type: Number,
        required: true
    }
});

export default mongoose.model('OverOccupancyCharge', overOccupancyCharge);
