const express = require('express');
const router = express.Router();
const {  ensureAuthenticated} = require('../config/auth');

router.get('/settings',ensureAuthenticated, function(req, res) {
    res.render("settings");
});

module.exports = router;