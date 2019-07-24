const path = require('path');
const express = require('express');
const router = express.Router();
const middleware = require('../middleware/auth/authMiddleware');

const Kewpa3 = require('../models/kewpa3');

/* ------------------------- Requiring controllers ------------------------- */
const printController = require('../controllers/printController');

/* ------------------------- Routes ------------------------- */

// Page to print || roll back if error happen
router.get('/print', middleware.isLoggedIn, printController.getPrintPage);

router.get('/print/kewpa3A/:id', middleware.isLoggedIn, printController.getKewpa3SecAPrint);

// PRINT KEWPA15
router.get('/print/kewpa15/:id', middleware.isLoggedIn, printController.getKewpa15Print);


// Print indens record
router.get('/print/indens/:id', middleware.isLoggedIn, printController.getIndensRecordPrint);
module.exports = router;