const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {  ensureAuthenticated} = require('../config/auth');

router.get('/:username',ensureAuthenticated, async function(req, res) {
    const {username } = req.params;
    if(username === req.user.username){
       res.render("profile" , {user: req.user});
    }else{
      await User.findOne({username},async (err,profile)=>{
        if(!err){
          if(profile){
             res.render('view-profile',{user:req.user, profile:profile});
          }else{
            res.render('404page');
          }
        } else{
         console.log("somthing went wrong");
       }
     });
    }
});



module.exports = router;