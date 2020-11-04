const express = require('express');
const router = express.Router();
const {  ensureAuthenticated} = require('../config/auth'); 
const User = require('../models/user');
const {ChatRoom }= require('../models/chatRoom');
const mongoose = require('mongoose');


router.get('/chat',ensureAuthenticated, function(req, res) {
    res.render("chat",{user:req.user, chatwith: ''});
});

router.get('/chat/:id',ensureAuthenticated,async function(req, res) {
    const {id} = req.params;
    const frnd = await User.
        findOne({username: req.user.username}).
        populate({
            path: 'following',
            match: { _id: id }}).
        exec();
    if(frnd.following.length===0){
        res.send("You can't send message to this user without follow.")
    }else{
        // res.send("fine");
        await User.
        find({
            _id: req.user._id,
            chatList: {$elemMatch: {userId: mongoose.Types.ObjectId(id)}}},(err,info)=>{
            if(err){
                console.log(err);
            }else{
               if(info.length===0 ){
                       
                        const newChat = new ChatRoom({
                           _id: new mongoose.Types.ObjectId(),
                        }) ;
                        newChat.save((err,res)=>{
                            if(err){
                                console.log(err);
                            }else{
                                 
                                User.findOneAndUpdate({username:req.user.username}, { $push: { chatList :{userId:mongoose.Types.ObjectId(id), chatId:res._id}}},{ upsert: true, new: true },(err,res1)=>{
                                    if(err){
                                        console.log(err);
                                    }
                                });
                                User.findOneAndUpdate({_id:id}, { $push: { chatList :{userId:req.user._id, chatId:res._id}}},{ upsert: true, new: true },(err,res2)=>{
                                    if(err){
                                        console.log(err);
                                    }
                                });
                            }
                        });
               }
               User.findOne({_id:id},(err,result)=>{
                    if(err){
                        console.log(err);
                    }else{
                        res.render("chat", {user:req.user,chatwith:result});
                    }
               });
            }
        });
         
    }    

});


module.exports = router;