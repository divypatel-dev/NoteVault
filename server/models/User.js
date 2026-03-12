const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, default: 'John Doe' },
    email: { type: String, default: 'john@example.com' },
    phone: { type: String, default: '+1 234 567 890' },
    profilePicture: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
