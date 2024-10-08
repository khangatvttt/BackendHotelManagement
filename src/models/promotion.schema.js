import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
    Code: {
        type: String,
        required: true,
        unique: true
    },
    Description: {
        type: String,
        required: true
    },
    DiscountPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    StartDate: {
        type: Date,
        required: true
    },
    EndDate: {
        type: Date,
        required: true
    },
    MinToUse: {
        type: Number,
        required: true
    },
    MaxBeReduced: {
        type: Number,
        required: true
    },
    LimitUse: {
        type: Number,
        required: true
    },
    UsedUse: [{
        type: mongoose.Schema.Types.ObjectId,
        sref: 'User'
    }]
});

export default mongoose.model('Promotion', promotionSchema);
