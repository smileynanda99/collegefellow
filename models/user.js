const mongoose   = require('mongoose');
const ChatRoom = require('./chatRoom');

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
    chatRoom:[{type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom'}],
    lastSeen: Number,
    active: Boolean,
    status: Boolean,
    otp: Number
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;
