const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {  ensureAuthenticated} = require('../config/auth');

router.post('/status',ensureAuthenticated,async function(req, res) {
    
        await User.find(
            {active: true}
            ,function(err,docs) { 
                 if(err){
                     console.log(err);
                 }else{
                     res.send(docs);
                 }
             }
         );
   
});

module.exports = router;