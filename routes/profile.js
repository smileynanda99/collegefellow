const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');
const Notification = require('../models/notification');
const {  ensureAuthenticated} = require('../config/auth');


router.get('/profile', ensureAuthenticated, function(req, res) {
    res.render("profile" , {user: req.user});
});


//follow
router.post('/profile/follow', ensureAuthenticated,async function(req, res) {
    const {from, to} = req.body.data;
    var fromId;
    var toId;
  
    await User.findOne({username:from},(err, result) => {
        if(!err){
            fromId= result._id;
        }});
    await User.findOne({username:to},(err, result) => {
        if(!err){
           toId=result._id;
        }});
    if(toId != null && fromId != null){
        User.findByIdAndUpdate(toId, { $push: { follow :fromId }},{ upsert: true, new: true },(err)=>{
            if(err){
                console.log(err)
                res.send(false);
            }});
        User.findByIdAndUpdate(fromId, { $push: { following :toId }},{ upsert: true, new: true },(err)=>{
            if(err){
                console.log(err)
                res.send(false);
            }});
        Notification.findOneAndUpdate({user_id:toId}, { $push: { newFollowing :{ _id: mongoose.Types.ObjectId(fromId) }}},{ upsert: true, new: true },(err)=>{
                if(err){
                    console.log(err)
                    // res.send(false);
                }});  
        res.send(true);
    }
});
//unfollow
router.post('/profile/unfollow', ensureAuthenticated,async function(req, res) {
    const {from, to} = req.body.data;
    var fromId;
    var toId;
  
    await User.findOne({username:from},(err, result) => {
        if(!err){
            fromId= result._id;
        }});
    await User.findOne({username:to},(err, result) => {
        if(!err){
           toId=result._id;
        }});
    User.findByIdAndUpdate(toId, { $pull: { follow :fromId }},{ upsert: true, new: true },(err)=>{
        if(err){
            console.log(err)
            res.send(false);
        }});
    User.findByIdAndUpdate(fromId, { $pull: { following :toId }},{ upsert: true, new: true },(err)=>{
        if(err){
            console.log(err)
            res.send(false);
        }});
    res.send(true);
});

router.post('/profile/followList', ensureAuthenticated, function(req, res) {
    const username = req.body.username;
    User.
    findOne({ username: username}).
    populate('follow').
    exec(function (err, user) {
    if (err) console.log(err);
    res.send(user.follow);
    }); 
});

router.post('/profile/followingList', ensureAuthenticated, function(req, res) {
    const username = req.body.username;
    User.
    findOne({ username: username}).
    populate('following').
    exec(function (err, user) {
    if (err) console.log(err);
    res.send(user.following);
    }); 
});

router.post('/profile/numNotification', ensureAuthenticated, function(req, res) {
    const flag = req.body.clear;
    // console.log(flag, typeof(flag));
    Notification.
    findOne({ user_id: req.user._id}).
    populate({path:'newFollowing._id'}).
    exec(function (err, user) {
    if (err) console.log(err);
    else{
        // console.log(user);
        // console.log(flag, typeof(flag));
        if(flag == "true"){
            Notification.findOneAndUpdate({user_id: req.user._id},{$set: { newFollowing: [] }}).exec((err,res)=>{
                if(err){console.log(err);}
            });
            // console.log("clean");
         }
        res.send(user);  
    }
    }); 
});






module.exports = router;