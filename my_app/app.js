require('isomorphic-fetch');
require('isomorphic-form-data');
// Build in module 
const path = require('path');
const fs = require('fs');

// Third party module
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
// var expressValidator = require('express-validator');
var _ = require('lodash');
const error_handlers = require('./middleware/error/error_handlers');
const pkginfo = require('pkginfo')(module, 'title', 'description');

const User = require('./models/user');

// Instantiate mongo db uri
const MONGODB_URI = 'mongodb://localhost/sispa_development';
const secret = 'hdfiuhsnjdndfheiufhugher3893845734875375634756348739873@#@!#@#!@3324';

// Mongodb connection option configuration
const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: false,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 500,
    poolSize: 10,
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4
}

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
// userclass setup
const { Users } = require('./helpers/userClass');
const { Global } = require('./helpers/Global');

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

// Requiring routes
const indexRoutes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');
const assetsRoutes = require('./routes/assetsRoutes');
const maintainanceRoutes = require('./routes/maintainanceRoutes');
const placementsRoutes = require('./routes/placementsRoutes');
const indensRoutes = require('./routes/indensRoutes');
const discussionsRoutes = require('./routes/discussionsRoutes');
const printRoutes = require('./routes/printRoutes');
const gisRoutes = require('./routes/gisRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' }
);

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

app.set('pkginfo', { 'title': exports.title, 'description': exports.description });
app.set('view engine', 'ejs');
app.set('views', 'views');
app.set(methodOverride('_method'));
app.locals.moment = require('moment');
app.use(flash());
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Passport configuration
app.use(
    session({
        secret: secret,
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

// Express Validator Middleware
/*
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));
*/

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    // Express Validator
    // res.locals.errors = null;
    next();
});

// init socket.io
require('./socket/groupchat')(io, Users)
require('./socket/globalroom')(io, Global, _);

io.use(passportSocketIo.authorize(
    {
        cookieParser: cookieParser,
        key: 'connect.sid',
        secret: secret,
        store: store,
        success: onAuthorizeSuccess,
        fail: onAuthorizeFail
    })
);

function onAuthorizeSuccess(data, accept) {
    accept();
};

function onAuthorizeFail(data, message, error, accept) {
    if (error) accept(new Error(message));
};

// Connect the route to app.js
app.use(indexRoutes);
app.use('/admin', authRoutes);
app.use('/index', assetsRoutes);
app.use(maintainanceRoutes);
app.use(placementsRoutes);
app.use(indensRoutes);
app.use(discussionsRoutes);
app.use(printRoutes);
app.use(gisRoutes);
app.use(complaintRoutes);

// if('development' == app.get('env')) {
//     express.errorHandler.title = exports.title;
//     app.use(express.errorHandler());
//     io.set('loglevel', 3);
// } else {
//     io.set('loglevel', 0);
// }

// Error handlers
// app.use(error_handlers.pageNotFoundHandler);
// app.use(error_handlers.logErrors);
// app.use(error_handlers.errorHandler);

// Start server
mongoose.connect(MONGODB_URI, options);
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Sispa berjaya dihubung pada pangkalan data.');
}).then(result => {
    const PORT = process.env.PORT || 3000;
    http.listen(PORT);
    console.log(`Telah stabil pada port ${PORT}.`);
    console.log(result.host);
}).catch(err => console.log(err));

// mongoose.set('debug', true);






















































