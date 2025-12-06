const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: Number,
    imgURL: String,
    stock: { type: Number,required: true,min: 0, default: 0 },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: true
    },
    isDeleted: { type: Boolean, default: false },
    slug: { type: String, required: true, unique: true }
}, {
    timestamps: true
});
module.exports = mongoose.model('Product', productSchema);
