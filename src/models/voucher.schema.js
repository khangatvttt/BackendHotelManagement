import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    minSpend: {
        type: Number,
        required: true
    },
    maxDiscount: {
        type: Number,
        required: true
    },
    limitUse: {
        type: Number,
        required: true
    },
    userUsedVoucher: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }]
});

export default mongoose.model('Voucher', voucherSchema);
