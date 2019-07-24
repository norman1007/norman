const path = require('path');
const express = require('express');
const router = express.Router();
const middleware = require('../middleware/auth/authMiddleware');

const { check, body } = require('express-validator/check');
const Suppliers = require('../models/suppliers');

/* ------------------------- Requiring controllers ------------------------- */

const indexController = require('../controllers/indexController');

/* ------------------------- Index Routes ------------------------- */

// Home routes
router.get('/', (req, res, next) => {
    const pageTitle = 'Laman Utama';
    res.redirect('/index');
    // res.redirect('/index/assets');
});

router.get('/index', middleware.isLoggedIn, indexController.getIndex);

// Admin Page
router.get('/admin', middleware.isLoggedIn, indexController.adminPage);

// userData
router.get('/admin/userData', middleware.isLoggedIn, indexController.getUserData);

// Lantik pegawai aset
router.get('/configuration', indexController.getConfiguration);

router.post('/configuration/new', indexController.postAssetsOfficer);

router.post('/configuration/delete_p_asset/:id', indexController.deleteAssetOfficer);

router.post('/configuration/p_kend', indexController.postKendOfficer);

router.post('/configuration/delete_p_kend/:id', indexController.deleteKendOfficer);

router.post('/profile-saya/:id/katalaluan', indexController.postChangeMyPassword);

// My Profile
const multer = require('multer');
const upload = multer({
    limits: {
        fileSize: 3000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|PNG)$/)) {
            return cb(new Error('Sila muatnaik gambar anda!'));
        }

        cb(undefined, true);
    }
});

router.get('/profile-saya/:id', middleware.isLoggedIn, indexController.getMyProfile);

router.post('/profile-saya/:id', upload.single('user[image]'), indexController.putEditMyProfile, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
});

router.get('/play', indexController.getPlay);

router.get('/profile-saya/:id/avatar', indexController.getProfileImage);

// router.post('profile-saya/:id/deleteAvatar', indexController.getDeleteProfileImage);

// Suppliers
router.get('/pembekal', middleware.isLoggedIn, indexController.getAllSuppliers);

router.post('/pembekal', 
    [check('supName', 'Sila isi nama syarikat / pembekal')
        .isString()
        .isLength({ min: 3 })
        .custom((value, {req}) => {
            return Suppliers.findOne({ supName: value }).then(exeInput => {
                if(exeInput) {
                    return Promise.reject(`Nama syarikat telah wujud, sila isi semula`);
                }
                return true
            });
        })
        .trim(),
    check('supAddr', 'Sila isi alamat syarikat / pembekal')
        .isString()
        .isLength({ min: 3 })
        .trim()
    ], 
indexController.postNewSupplier);

router.post('/pembekal/:id', middleware.isLoggedIn, indexController.postDeleteSupplier);



module.exports = router;








