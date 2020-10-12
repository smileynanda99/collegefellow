const express = require('express');
const router = express.Router();
const {  ensureAuthenticated} = require('../config/auth'); 

router.get('/chat',ensureAuthenticated, function(req, res) {
    res.render("chat");
});

module.exports = router;