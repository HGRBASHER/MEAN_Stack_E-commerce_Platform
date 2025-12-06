const mongoose = require('mongoose');

const footerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    phone: { 
        type: String, 
        default: '' 
    },
    address: { 
        type: String, 
        default: '' 
    },
    facebook: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    instagram: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Footer', footerSchema);