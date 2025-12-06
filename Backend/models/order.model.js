const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card'],
        default: 'cash'
    },
    status: {
        type: String,
        enum: ['pending', 'preparing', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending'
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    cancelReason: {
        type: String,
        default: ''
    }
}, { timestamps: true });
orderSchema.pre(/^find/, function(next) {
    this.where({ 
        $or: [
            { deleted: false },
            { status: 'returned' }
        ]
    });
    next();
});

module.exports = mongoose.model('Order', orderSchema);