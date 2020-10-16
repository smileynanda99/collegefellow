const mongoose   = require('mongoose');
const User = require('./user');

const chatSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    chat_id: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    msg: String,
    time: Number
});

const ChatRoom = mongoose.models.ChatRoom || mongoose.model('ChatRoom', chatSchema);
module.exports = ChatRoom;