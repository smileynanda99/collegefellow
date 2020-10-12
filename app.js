//jshint esversion:6
require("dotenv").config();
//import express  and other js libarary
const express = require("express");
const bodyParser = require("body-parser");     
const mongoose = require('mongoose');
const session =require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

require('./config/passport-config')(passport);

//define port
const PORT = process.env.PORT || 3000;

//make our express app
const app = express();

//mongoose connect and set plugins
mongoose.connect(process.env.DB_URL, 
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

//Express Session
app.use(session({
  secret: process.env.SESS_SECRET,
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
app.use('/', require('./routes/settings'));

//listen of port :3000
app.listen(PORT, () => {
    console.log(`server is running at port :${PORT}`);
})


// async function call(){
//   var ownId;
//   var otherId;

//   await User.findOne({name:'RK'},(err, result) => {
//       if(!err){
//           console.log(result._id);
//           ownId=result._id;
//       }
//   });
  
//   await User.findOne({name:'smile'},(err, result) => {
//       if(!err){
//           console.log(result._id);
//           otherId=result._id;
//       }
//   });

//   User.findByIdAndUpdate(ownId, { $push: { follow :otherId }},{ upsert: true, new: true },(err)=>
//   console.log(err)
//   );
//    User.findByIdAndUpdate(otherId, { $push: { following :ownId }},{ upsert: true, new: true },(err)=>
//   console.log(err)
//   );
// }
// // call();