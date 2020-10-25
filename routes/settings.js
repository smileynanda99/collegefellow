const express = require('express');
const router = express.Router();
const multer  = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const {  ensureAuthenticated} = require('../config/auth');
const saltRounds = 10;


var message ="";
var type="";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads-profile/');
    },
    filename: (req, file, cb) => {
        if(!req.user.photo || req.user.photo ==="default-profile.png"){
            cb(null, "IMG_" + Date.now() + path.extname(file.originalname));
        }else{
            cb(null, req.user.photo);
        }  
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'image/jpg') {
        cb(null, true)
    } else {
        return cb(new Error('Only .jpg, .jpeg and .png formate is allowed.',false));
    }
}
const upload = multer({ storage: storage, fileFilter: fileFilter }).single('image');


router.post('/settings/upload', ensureAuthenticated,function(req, res) {
    upload(req,res,async (err)=>{
        if(err){
            message = "Only .jpg, .jpeg and .png formate is allowed.";
            type="danger";
            res.redirect('/settings');
        }else{
            try {
                await User.findOneAndUpdate({collegeEmail:req.user.collegeEmail},{photo:req.file.filename});
                message = "Profile Image upload successfully.";
                type="success"
                res.redirect('/settings');
            } catch (error) {
                console.error(error);
            }
        }
    });
});


router.get('/settings/remove', ensureAuthenticated,async function(req, res){
    try {
        await User.findOneAndUpdate({collegeEmail:req.user.collegeEmail},{photo:"default-profile.png"});
        message = "Profile Image Removed successfully.";
        type="success"
        res.redirect('/settings');
    } catch (error) {
        console.error(error);
    }
});

router.post('/settings/changeSave', ensureAuthenticated, async (req, res)=>{
      const { username, name, gender, phoneNo, bio} = req.body;
      if(username === req.user.username){
        try {
            await User.findOneAndUpdate({username},{name, gender, phoneNo, bio});
            message = "Profile change Saved successfully.";
            type="success"
            res.redirect('/settings');
        } catch (error) {
            console.error(error);
        }
      } else{

        await User.find({username:req.body.username},async (err,result)=>{
        if(!err){
            if(result.length>0){
                message = "Username is Already taken by someone else";
                type="danger"
                res.redirect('/settings');
            }else{ 
              try {
                await User.findOneAndUpdate({username:req.user.username},{username, name, gender, phoneNo, bio});
                message = "Profile change Saved successfully.";
                type="success"
                res.redirect('/settings');
              } catch (error) {
                console.error(error);
              } 
            }
        }else{
              console.log("somthing went wrong");
              message = "somthing went wrong.";
              type="danger"
              res.redirect('/settings');
        }
        })
      }
});



router.post('/settings/changePass', ensureAuthenticated,(req, res)=>{
    const { oldPass, newPass, confirmPass} = req.body;
    if(newPass =='' || confirmPass == '' || oldPass == ''){
        message = "Please enter all Imformative  required field.";
        type="warning"
        res.redirect('/settings');

    } else{
        if(newPass !== confirmPass){
            message = "Confirm  new password not matched.";
            type="danger"
            res.redirect('/settings');
        } 
        else if(newPass.length < 6){
            message = "Password must be at least 6 characters.";
            type="warning"
            res.redirect('/settings');
        }
        else{
            bcrypt.compare(oldPass, req.user.password, (err,result)=>{
                if(err) {
                    message = "somthing went wrong.c";
                    type="danger"
                    res.redirect('/settings');
                }else{
                    if(result === true){
                        bcrypt.hash(newPass, saltRounds,async function(err, hash) {
                            if(err){
                                message = "somthing went wrong.h";
                                type="danger"
                                res.redirect('/settings'); 
                            }else{
                                await User.findOneAndUpdate({username:req.user.username},{password:hash});
                                message = "New Password is reset successfully.";
                                type="success"
                                res.redirect('/settings'); 
                            }
    
                        });
                    } else{
                        message = "Old Password incorrect.";
                        type="danger"
                        res.redirect('/settings');
                    }
                }
            });
       }
    } 
   
});


router.get('/settings',ensureAuthenticated, function(req, res) {
    res.render("settings", {user: req.user, message,type});
    message='';
});

module.exports = router;