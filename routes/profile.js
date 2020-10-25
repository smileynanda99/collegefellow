const express = require('express');
const router = express.Router();

const {  ensureAuthenticated} = require('../config/auth');


router.get('/profile', ensureAuthenticated, function(req, res) {
    res.render("profile" , {user: req.user});
});


router.get('/profile/follow/:username', ensureAuthenticated, function(req, res) {
    const {username } = req.params;
    res.send("successfully follow "+username);
});

router.get('/profile/unfollow/:username', ensureAuthenticated, function(req, res) {
    const {username } = req.params;
    res.send("successfully unfollow "+username);
});



module.exports = router;