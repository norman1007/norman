const path = require('path');
const express = require('express');
const router = express.Router();
const middleware = require('../middleware/auth/authMiddleware');

const { check, body } = require('express-validator/check');
const User = require('../models/user');
const Kewpa3 = require('../models/kewpa3');

/* ------------------------- Requiring controllers ------------------------- */
const assetsController = require('../controllers/assetsController');

/* ------------------------- Routes ------------------------- */
router.get('/assets', middleware.isLoggedIn, assetsController.getAllAssets);

router.get('/assets/new', middleware.isLoggedIn, assetsController.getNewAssets);

router.post('/assets/new', 
    [check('file_ast', 'Sila masukkan No. Siri Pendaftaran')
        .isString()
        .isLength({ min: 3 })
        .custom((value, {req}) => {
            return Kewpa3.findOne({ file_ast: value }).then(input => {
                if(input) {
                    return Promise.reject(`No. Siri Pendaftaran ${req.body.file_ast} telah wujud!`);
                }
                return true
            });
        })
        .trim(),
    body('ast_desc', 'Sila masukkan Keterangan Aset')
        .isString()
        .isLength({ min: 5 })
        .trim(),
    body('ori_acq', 'Sila masukkan Harga Perolehan asal')
        .isFloat().withMessage('Nilai yang dimasukkan wajib dalam perpuluhan .00')
        .trim(),
    body('ast_type', 'Sila masukkan jenis / jenama / model')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('acq_dt', 'Sila masukkan tarikh perolehan'),
    check('casis', 'Sila masukkan No. Casis / Siri Pembuat')
        .isString()
        .isLength({ min: 5 })
        .custom((value, {req}) => {
            return Kewpa3.findOne({ casis: value }).then(input => {
                if(input) {
                    return Promise.reject(`No. Casis / Siri Pembuat ${req.body.casis} telah wujud`);
                }
                return true
            });
        })
        .trim(),
    body('lOrder', 'Sila masukkan No. Pesanan Rasmi Kerajaan / Kontrak')
        .trim(),
    check('ast_reg', 'Sila masukkan No. Pendaftaran jika Kenderaan')
        .isString()
        .isLength({ min: 5 })
        .custom((value, {req}) => {
            return Kewpa3.findOne({ast_reg: value}).then(input => {
                if(input) {
                    return Promise.reject(`No. Pendaftaran ${req.body.ast_reg} telah wujud`);
                }
                return true
            });
        })
        .trim(),
    body('sup', 'Sila pilih Nama Syarikat'),
    body('sup_Addr', 'Sila pilih Alamat Syarikat')
    ],
assetsController.postNewAsset);

router.get('/assets/:id', middleware.isLoggedIn, assetsController.getOneAsset);

router.get('/assets/:id/edit', middleware.isLoggedIn, assetsController.getEditOneAsset);

router.post('/assets/:id', assetsController.putEditOneAsset);

module.exports = router;