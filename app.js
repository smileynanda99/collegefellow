//jshint esversion:6
require("dotenv").config();
//import express  and other js libarary
const express = require("express");
//make our express app
const app = express();
const bodyParser = require("body-parser");     
const mongoose = require('mongoose');
const session =require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
//import model
const User = require('./models/user');
const {ChatRoom, ChatMsg }= require('./models/chatRoom');
require('./config/passport-config')(passport);

//define port
const PORT = process.env.PORT || 3000;


//mongoose connect and set plugins
mongoose.connect(process.env.CUSTOMCONNSTR_DB_URL || process.env.DB_URL, 
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB Connected'))
  .catch(err=> console.log(err));
mongoose.set("useCreateIndex", true);
mongoose.set('useFindAndModify', false);

//Ejs View engine
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));

//body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//connect flash messaging
app.use(flash());

//set socket.io
app.set("socketio", io);
//Express Session
app.use(session({
  secret: process.env.APPSETTING_SESS_SECRET || process.env.SESS_SECRET,
  name: 'sessionId',
  resave: true,
  saveUninitialized: true,
  rolling: true,
  cookie: { maxAge: 1*30*60*1000} //30 mints
}))

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Global variable 
app.use((req, res, next)=>{
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
})

//set routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/', require('./routes/profile'));
app.use('/', require('./routes/chat'));
app.use('/', require('./routes/explore'));
app.use('/', require('./routes/active'));
app.use('/', require('./routes/settings'));
app.use('/', require('./routes/view'));



//chat
io.on('connection', socket => {
  socket.on('newUser',async(username)=>{
       socket.id=username;
       await User.findOneAndUpdate({username:socket.id},{active:true});
  });
  socket.on('joinChat',({username,room})=>{
       const user = {username, room};
       socket.join(user.room);
      //  console.log(user);
  });
  socket.on('typing',(room, id)=>{
     socket.broadcast.emit('typing', room, id);
  });
  socket.on('read',async (room, id)=>{
    await ChatRoom.
        findOne({_id:mongoose.Types.ObjectId(room) }).
        populate({path: 'chats',populate: { path: 'sender' }, options: { sort: { 'time': -1 }, limit:2} }).
        exec((err,result)=>{
            if(err){
                console.log(err);
            }else{
                // console.log(result.chats[0].sender._id, req.user._id );
                if(String(result.chats[0].sender._id) !== String(id)){
                    ChatRoom.findOneAndUpdate({_id: room},{ seen:true},(err,res)=>{
                        if(err){
                            console.log(err);
                        }
                        // console.log("seen true kr rha hu!!", id);
                        socket.broadcast.emit('read', room, id);
                    });
                }
            }
        })
        
  });
  socket.on('chatMessage',(msg, id,room)=>{
    
      io.emit('message',{msg, id, room});
      const msgInfo = new ChatMsg({
        _id:new mongoose.Types.ObjectId(),
        sender: mongoose.Types.ObjectId(id),
        msg: msg,
        time: new Date().getTime()

      });
      msgInfo.save((err,res)=>{
        if(!err){
          ChatRoom.findOneAndUpdate({_id: room},{$push:{chats:mongoose.Types.ObjectId(res._id)}, seen:false},{ upsert: true, new: true },(err,res)=>{
            if(err){
              console.log(err);
            }
          })
        }
        else{
          console.log(err);
        }
      });
  });
  socket.on('disconnect', async() => {
    await User.findOneAndUpdate({username:socket.id},{active:false, lastSeen:new Date().getTime()});
  });
});

// app.listen(process.env.PORT ,process.env.IP, function () {
//     console.log("server is running at port 3000!");
// });
//listen of port :3000
server.listen(PORT, () => {
    console.log(`server is running at port :${PORT}`);
})

