const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport')
const mongoose = require('mongoose');
const crypto = require('crypto');
const Notification = require('../models/notification');
//mail setup
const mailgun = require('mailgun-js');
const API_KEY = process.env.APPSETTING_SG_MAIL_API_KEY || process.env.SG_MAIL_API_KEY;
const DOMAIN = 'collegefellow.social';
const mg = mailgun({apiKey: API_KEY, domain: DOMAIN});
//import model
const User = require('../models/user');
//import config
const { forwardAuthenticated } = require('../config/auth');
const { session } = require('passport');
//global variable
const saltRounds = 10;
let errors = [];


//Register Page
router.get('/register', forwardAuthenticated, function(req, res) {
    res.render("register");
});

//Login Page
router.get('/login', forwardAuthenticated, function(req, res) {
    res.render("login");
});

//Handel Register
router.post('/register',async function(req, res) {
    async function sendEmail(msg){
        sgMail.send(msg, function(err, json) {
          if (err) { return console.error(err); }
        });
    };
    const { username, collegeName, collegeEmail, password} = req.body;
        await User.findOne({ collegeEmail: collegeEmail }).then(user =>{
        if(user){
            errors.push({ msg: "Email already exists"});
            res.render('register', {
                errors,
                username,
                collegeEmail,
                collegeName,
                password
            });
        } else{
            
            bcrypt.hash(password, saltRounds, function(err, hash) {
                // Store hash in your password DB.
                if(err){
                    console.log(err);
                }
                else{
                    emailToken = Math.floor(Math.random()*1000000+1);
                    const data = {
                        from: 'Verification Email <smileynanda99@gmail.com>',
                        to: collegeEmail,
                        subject: 'College fellowers- verify your email.',
                        text:`Email verify`,
                        html:`<h1 style="color: #d03737" >Hello College Fellower</h1>
                        <p>Thanks for Registering on college fellow.</p>
                        <a class="btn btn-primary" href="https://collegefellow.azurewebsites.net/users/confirm/${collegeEmail}/${emailToken}">Verify your account</a>`
                      }
                    const newUser = new User({
                    _id:new mongoose.Types.ObjectId(),
                    username,
                    collegeName,
                    collegeEmail,
                    password : hash,
                    photo:"default-profile.png",
                    otp: emailToken,
                    status: false
                });
                newUser.save().then(user => {
                    mg.messages().send(data, function (error, body) {
                        if(error){
                            console.log(error);   
                        }
                    });
                    const noti = new Notification({
                        _id: new mongoose.Types.ObjectId(),
                        user_id: user._id
                    });
                    noti.save();
                    req.flash('success_msg','Thanks for Register go with verify email');
                    res.redirect('./login');
                
                })
                }
            

            });
            
            
        }
    })

});

//Handel Login
router.post('/login', (req, res, next) => {
    if(req.body.checkbox ==="remember"){
        req.session.cookie.maxAge=253402300000000; //31 Dec. 9999 Friday
    }
    passport.authenticate('local', {
      successRedirect: '/profile',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  });

router.post('/resetPass', async (req,res)=>{
    async function sendEmail(msg){
        sgMail.send(msg, function(err, json) {
          if (err) { return console.error(err); }
        });
    };
    await User.find({collegeEmail:req.body.collegeEmail}, (err,result)=>{
        if(!err){
            if(result.length>0){
                const getPassword= crypto.randomBytes(8).toString('hex');
                const data = {
                    from: 'Reset Password <smileynanda99@gmail.com>',
                    to: req.body.collegeEmail,
                    subject: 'College fellowers- Reset Password.',
                    text:`Reset Password`,
                    html:`<h3>your password is reset. Now you can Login with bellow password.</h3>
                          <h2 style="color: #d03737" >${getPassword}</h2>`
                  }
                bcrypt.hash(getPassword, saltRounds,function(err, hash) {
                    if(!err){
                        mg.messages().send(data,async  function (error, body) {
                            if(error){
                                console.log(error); 
                                req.flash('error_msg','Something went Wrong.');
                                res.redirect('./login');  
                            }else{
                                await User.findOneAndUpdate({collegeEmail:req.body.collegeEmail},{password:hash});
                                req.flash('success_msg','New Password is send on Registered email.');
                                res.redirect('./login');
                            }
                        });
                        
                    }
                });

            }else{
                req.flash('error_msg','That email is not registered');
                res.redirect('./login');
            }
        }
    });
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy(err=>{
        if(err){
            console.log(err,"louout err");
        }
        res.clearCookie('sessionId');
        res.redirect('/');
    })
});



router.get('/confirm/:collegeEmail/:otp',async function(req, res) {
    const {collegeEmail , otp} = req.params;
    await User.find({collegeEmail:collegeEmail},async (err,result)=>{
       if(!err){
         if(result){
            if(String(result[0].otp)=== otp){
                await User.findOneAndUpdate({collegeEmail},{otp: null, status:true});
                req.flash('success_msg','User verifyed and you can login');
                res.redirect('/users/login');
             } else if(String(result[0].otp)=== "null"){
                req.flash('success_msg','User Already verifyed, you can go with login.');
                res.redirect('/users/login');
             }
             else{
                req.flash('error_msg','OTP not match');
                res.redirect('/users/login'); 
             }
         }else{
             errors.push({ msg: "That email is not registered"});
             res.render('register', {
                errors
            });
         }
       } else{
        console.log("somthing went wrong");
        req.flash('error_msg','Somthing went wrong, Maybe verify url invalid');
        res.redirect('/users/login'); 
      }
    })
});

router.post('/userAvailable', function(req, res) {
    User.find({username:req.body.data},(err,result)=>{
      if(!err){
          res.send(String(result.length));
      }else{
        console.log("somthing went wrong");
      }
  })
});



module.exports = router;