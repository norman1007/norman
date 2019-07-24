const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const async = require('async');

// Module for validation
const { validationResult } = require('express-validator/check');

// For reset user password before logged in
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const key = require('../key');

// Mailgun setup
const api_key = 'key-e1369783913829f078063aea81447290';
const domain = 'sandbox3e510ea5494a46aabd0b1b1b9dd85164.mailgun.org';
const mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });
const sharp = require('sharp');
const multer = require('multer');
const storage = multer.diskStorage({ 
    destination: function(req, file, cb) {
        cb(null, './public/uploads.profile');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage }).single('image');

// Requiring User model
const User = require('../models/user');

// Sign up page
exports.getRegister = async (req, res, next) => {
    const pageTitle = 'Daftar Pengguna';
    let user = await User.find().exec();
    
    res.render('admin/auth/register', {
        pageTitle,
        user, 
        hasError: false,
        errorMsg: null,
        oldInput: {
            emp_name: "",
            username: "",
            password: "",
            email: "",
            department: ""
        },
        boxColorValidate: []
    });
};

// Handle Sign up logic
exports.postRegister = (req, res, next) => {

    upload(req, res, function(err) {

        // Store all input into variable
        const emp_name = req.body.emp_name;
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const department = req.body.department;

        // Check to validate the input for register a user
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            User.find().then(user => {
                return res.status(422).render('admin/auth/register', {
                    pageTitle: 'Sila daftar semula pengguna.',
                    user: user,
                    errorMsg: errors.array()[0].msg,
                    oldInput: {
                        email: email,
                        emp_name: emp_name,
                        username: username,
                        password: password,
                        department: department
                    },
                    boxColorValidate: errors.array()
                });
            });
        }

        // Upload the profile image
        if(err) {
            return res.send('Muatnaik fail ralat.');
        } 
        let image = req.body.avatar;
        if(typeof req.file !== 'undefined') {
            image = '/uploads/profile/' + req.file.filename;
        } else {
            image = '/uploads/profile/default/no-image.png';
        }

        // Hash password & register user
        bcrypt.hash(password, 12).then(hashPswd => {
            const newUser = new User({
                emp_name: emp_name,
                email: email,
                username: username,
                password: hashPswd,
                image: image,
                department: department
            });
            // Make a user as admin if true
            const isAdmin = req.body.isAdmin;
            if(isAdmin === 'true') {
                newUser.isAdmin = true;
            }
            // Make a user as active if default value is true
            const isActive = req.body.isActive;
            if(isActive === 'true') {
                newUser.isActive = true;
            }

            // Register a user
            User.register(newUser, password, (err, user, email) => {
                if(err) {
                    req.flash('error', err.message);
                }
                passport.authenticate('local')(req, res, () => {
                    req.flash('success', 'Anda telah mendaftar ' + username + ' sebagai pengguna.');
                    res.redirect('/index');
                });
            });

        }).catch(err => console.log(err));
    });
};

// Handle sign in page
exports.getLogin = (req, res, next) => {
    const pageTitle = 'Log Masuk Pengguna';
    let message = req.flash('error');
    if(message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render('admin/auth/login', {
        path: '/admin/login',
        pageTitle,
        errorMsg: message,
        oldInput: {
            username: "",
            password: ""
        },
        boxColorValidate: []
    });
};

exports.postLogin = async (req, res, next) => {
    
    let user = await User.find().exec();

    // Handling input validation
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).render('admin/auth/login', {
            path: '/admin/login',
            pageTitle: ':: Sila login semula - SISPA ::',
            error: errors.array()[0].msg,
            oldInput: {
                username: user.username,
                password: user.password
            },
            boxColorValidate: errors.array()
        });
    }

    passport.authenticate('local', {
        successRedirect: '/index',
        failureRedirect: '/admin/login',
        failureFlash: true,
    })(req, res, next)
};

// Change password before signin
exports.getChangePswd = (req, res, next) => {
    const pageTitle = 'Tukar Katalaluan';

    res.render('admin/auth/reset', {
        pageTitle
    });
};

exports.postChangedPswd = (req, res, next) => {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                const token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            const emailUser = req.body.email;
            User.findOne({ emailUser }), function(err, user) {
                if(err || !user) {
                    console.log(err);
                    req.flash('error', `${emailUser} tidak wujud.`);
                    return res.redirect('/tukar-katalaluan');
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000;

                user.save(function(err) {
                    done(err, token, user);
                });
            }
        },
        function(token, user, done) {
            // Nodemailer
            let smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: true,
                auth: {
                    user: 'pentadbir.mdlgpdtlg@gmail.com',
                    pass: process.env.GMAILPW
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            let mailOptions = {
                to: user.email,
                from: '"Pentadbir sistem " <pentadbir.mdlgpdtlg@gmail.com>',
                subject: 'Sispa - Tukar katalaluan',
                text: '<donotreply> Sila klik pada pautan ini atau salin ke pelayan atas talian anda ' + 'https://' + req.headers.host + '/reset/' + token + '\n' + 'Terima kasih.'
            };
            smtpTransport.sendMail(mailOptions, function(err, info) {
                if(err) {
                    console.log(err);
                    req.flash('error', err.message);
                    return res.redirect('back');
                } else {
                    console.log('Email dihantar ' + info.response);
                    req.flash('success', 'Email telah dihantar kepada ' + user.email + ' beserta arahan selanjutnya.');
                }
            });
        } 
    ], function(err) {
        if(err) return next(err);
        res.redirect('/admin/tukar-katalaluan');
    });
};




