const express = require('express');
const middleware = require('../middleware/auth/authMiddleware');
const { check, body } = require('express-validator/check');
const router = express.Router();

const maintainanceController = require('../controllers/maintainanceController');

router.get('/index/assets/:id/maintainance/new', maintainanceController.getAssetMaintainance);

router.post('/index/assets/:id/maintainances', maintainanceController.postAssetMaintainance)

router.post('/index/assets/:id/maintainances/:mtnc_id', maintainanceController.postDeleteMaintainance);

router.get('/index/assets/:id/maintainance/template', maintainanceController.getTemplate);

module.exports = router;