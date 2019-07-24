// Report and error response with the appropriate status code

var errorRoute = require('../../routes/errorRoute');

exports.pageNotFoundHandler = function(req, res) {
    res.status = 404;
    res.app.set('errorMessage', 'Page not found.');
    errorRoute.report(req, res);
};

exports.errorHandler = function(err, req, res, next) {
    res.status = 500;
    res.app.set('errorMessage', err);
    errorRoute.report(req, res);
};

exports.logErrors = function(err, req, res, next) {
    console.error(err.stack);
    next(err);
};