const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {  ensureAuthenticated} = require('../config/auth');

router.post('/explore',ensureAuthenticated,async function(req, res) {
    const query = req.body.data;
    if(query!==''){
        await User.find({
            $and:[{status: true},
                { $or:[
                    {username: { "$regex": query, "$options": 'i' }},
                         {name: { "$regex": query, "$options": 'i' }},
                  {collegeName: { "$regex": query, "$options": 'i' }},
                  {collegeEmail: { "$regex": query, "$options": 'i' }}
                 ]}]
        }, 
             function(err,docs) { 
                 if(err){
                     console.log(err);
                 }else{
                     res.send(docs);
                 }
             }
         );
    }else{
        res.send(""); 
    }
});

module.exports = router;