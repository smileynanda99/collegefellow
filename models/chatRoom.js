const mongoose   = require('mongoose');
const User = require('./user');

//msg schema
const chatMsgSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    msg: String,
    time: Number
});
const ChatMsg = mongoose.models.ChatMsg || mongoose.model('ChatMsg', chatMsgSchema);

//chatTable schema
const chatTableSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    seen: Boolean,
    chats:[{type: mongoose.Schema.Types.ObjectId, ref: 'ChatMsg'}],
});
const ChatRoom = mongoose.models.ChatRoom || mongoose.model('ChatRoom', chatTableSchema);


module.exports = {ChatRoom, ChatMsg};