const mongoose   = require('mongoose');
const User = require('./user');

const notificationSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    newFollowing:[{_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }}]
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
module.exports = Notification;
