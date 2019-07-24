// Requiring User model
const User = require('../../models/user');

const middlewareObj = {};

// Check if a user is logged in
middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'Sila Log Masuk.');
    res.redirect('/admin/login');
};

module.exports = middlewareObj;