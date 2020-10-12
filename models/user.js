const mongoose   = require('mongoose');
const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username:{
        type: String,
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
    follow:[  { type: mongoose.Schema.Types.ObjectId, ref:'User'}],
    following:[{ type: mongoose.Schema.Types.ObjectId, ref:'User'}],
    sendRequest:[  { type: mongoose.Schema.Types.ObjectId, ref:'User'}],
    recievedRequest:[{ type: mongoose.Schema.Types.ObjectId, ref:'User'}],
    status: Boolean,
    otp: Number
});

module.exports = mongoose.models.Users || mongoose.model('Users', userSchema);

