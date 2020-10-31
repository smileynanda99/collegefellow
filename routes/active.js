const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {  ensureAuthenticated} = require('../config/auth');

router.post('/status',ensureAuthenticated,async function(req, res) {
        const docs = await User.
        findOne({username: req.user.username}).
        populate({
            path: 'following',
            match: { active: true }}).
        exec();
        res.send(docs.following);
});

module.exports = router;
