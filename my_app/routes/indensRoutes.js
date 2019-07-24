const express = require('express');
const router = express.Router();
const middleware = require('../middleware/auth/authMiddleware');

const { check, body } = require('express-validator/check');
const Indens = require('../models/indens');

const indensController = require('../controllers/indensController');

// Inserting new inden
router.post('/index/assets/:id/indens', indensController.postAddInden);

// Delete inden
router.post('/index/assets/:id/indens/:inden_id', indensController.postDeleteInden);

module.exports = router;