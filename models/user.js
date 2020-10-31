const mongoose   = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username:{
        type: 'String',
        unique: true,
      },
    collegeEmail:{
        type: String,
        unique: true,
    },
    password: String,
    photo: String,
    name: String,
    phoneNo: Number,
    collegeName: String,
    gender: String,
    bio: String,
    follow:[ this],
    following:[ this],
    lastSeen: Number,
    active: Boolean,
    status: Boolean,
    otp: Number
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;
