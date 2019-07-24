const express = require('express');
const middleware = require('../middleware/auth/authMiddleware');
const router = express.Router();

const { check, body } = require('express-validator/check');

const discussionsController = require('../controllers/groupChatController');

router.post('/index/assets/:id/discussions', middleware.isLoggedIn, discussionsController.postGroupDiscussions);

router.post('/index/assets/:id/discussions/:grpCht_id', middleware.isLoggedIn, discussionsController.postDeleteGroupChat);

module.exports = router;