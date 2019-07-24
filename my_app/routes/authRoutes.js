const path = require('path');
const express = require('express');
const router = express.Router();
const middleware = require('../middleware/auth/authMiddleware');

/* ------------------------- Requiring controllers ------------------------- */

const authController = require('../controllers/authController');

/* ------------------------- Authenticate Routes ------------------------- */

router.get('/register', authController.getRegister);

router.post('/register', authController.postRegister);

router.get('/login',authController.getLogin);

router.post('/login', authController.postLogin);

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/admin/login');
});

router.get('/tukar-katalaluan', authController.getChangePswd);

router.post('/tukar-katalaluan', authController.postChangedPswd);

module.exports = router;








