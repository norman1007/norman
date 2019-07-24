const express = require('express');
const router = express.Router();
const middleware = require('../middleware/auth/authMiddleware');

const { check, body } = require('express-validator/check');
const Placements = require('../models/placements');

const placementsController = require('../controllers/placementsController');

router.post('/index/assets/:id/placements', 
    [
    check('offName', 'Sila masukkan nama pegawai')
        // .isString()
        // .isLength({min: 3})
        .trim(),
    body('plcDate', 'Sila masukkan tarikh penempatan aset'),
    check('loc', 'Sila masukkan lokasi penempatan aset')
        // .isString()
        // .isLength({min: 3})
        .trim()
    ],
placementsController.postPlacements);

router.post('/index/assets/:id/placements/:plcId', placementsController.postDeletePlacements);

module.exports = router;