const express = require('express');
const router = express.Router();
const {  ensureAuthenticated} = require('../config/auth');

router.get('/explore',ensureAuthenticated, function(req, res) {
    res.render("explore");
});

module.exports = router;