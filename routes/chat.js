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


router.post('/room',ensureAuthenticated,async function(req, res) {
    const id = req.body.id;
    const info = await User.
        findOne({username: req.user.username}).
        exec();
        // console.log(info);
        info.chatList.forEach(element => {
            if(element.userId ==id){
                res.send(element.chatId);
            }
        }); 
});

router.post('/chatWith',ensureAuthenticated,async function(req, res) {
    const id = req.body.id;
    await User.
        findOne({_id: id}).
        exec((err,result)=>{
            if(!err){
                res.send(result);
            }
        });
        
});

router.post('/chatList',ensureAuthenticated,async function(req, res) {
    
    await User.
    findOne({ username: req.user.username}).
    populate({
        path: 'chatList.userId'
    }).
    exec((err,result)=>{
        if(err){
            console.log(err);
        }else{
            // console.log(result);
            res.send(result.chatList);
        }
    })

});


router.post('/chatMessage',ensureAuthenticated,async function(req, res) {
    const room = req.body.room;
    await ChatRoom.
        findOne({_id:mongoose.Types.ObjectId(room) }).
        populate({path: 'chats',populate: { path: 'sender' }, options: { sort: { 'time': -1 }, limit:7} }).
        exec((err,result)=>{
            if(err){
                console.log(err);
            }else{
                // console.log(result);
                res.send(result.chats);
            }
        })
        
});


router.post('/oldChatMessage',ensureAuthenticated,async function(req, res) {
    const room = req.body.room;
    const scroll = Number(req.body.scroll);
    await ChatRoom.
        findOne({_id:mongoose.Types.ObjectId(room) }).
        populate({path: 'chats',populate: { path: 'sender' }, options: { sort: { 'time': -1 },skip: 7*scroll, limit:7} }).
        exec((err,result)=>{
            if(err){
                console.log(err);
            }else{
                // console.log(result);
                res.send(result.chats);
            }
        })
        
});

module.exports = router;