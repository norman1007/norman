const path = require('path');
const express = require('express');
const router = express.Router();
const middleware = require('../middleware/auth/authMiddleware');

const { check, body } = require('express-validator/check');

/* ------------------------- Requiring controllers ------------------------- */
const complaintController = require('../controllers/complaintController');

/* ------------------------- Requiring routes ------------------------- */
router.get('/aduan', middleware.isLoggedIn, complaintController.getAllComplaint);

router.get('/aduan/new', middleware.isLoggedIn, complaintController.getAddComplaint);

router.post('/aduan/new',
    // [check('issue', 'Sila isi isu yang mahu dikemukakan!')
    //     .isString()
    //     .isLength({ min: 3 })
    //     .trim(),
    // check('desc', 'Sila hurai isu yang mahu dikemukankan!')
    //     .isString()
    //     .isLength({ min: 5 })
    //     .trim()
    // ],
    complaintController.postNewComplaint
);

router.get('/aduan/:id/success', middleware.isLoggedIn, complaintController.getSuccessComplaint);

router.get('/aduan/:id', middleware.isLoggedIn, complaintController.getReadComplaint);

router.get('/aduan/:id/edit', middleware.isLoggedIn, complaintController.getEditComplaintStatus);

router.post('/aduan/:id/edit', complaintController.putEditComplaintStatus);

router.post('/aduan/:id/reviews', complaintController.postNewReviews);

module.exports = router;