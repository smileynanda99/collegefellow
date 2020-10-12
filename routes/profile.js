const express = require('express');
const router = express.Router();
const {  ensureAuthenticated} = require('../config/auth');

router.get('/profile', ensureAuthenticated, function(req, res) {
    res.render("profile");
});

module.exports = router;