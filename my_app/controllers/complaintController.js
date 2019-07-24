const fs = require('fs')
const path = require('path');
const { validationResult } = require('express-validator/check');

const nodemailer = require('nodemailer');

/* Requiring these models to store data in db */
const Complaints = require('../models/complaints');
const User = require('../models/user');
const Reviews = require('../models/reviews');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/uploads/aduan');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }
}).single('attach');

exports.getAllComplaint = async (req, res, next) => {

    /* Search function */
    function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }

    const pageTitle = 'Aduan Pengguna';
    let searchFunction = req.query.search;
    const perPage = 10;
    const pageQuery = parseInt(req.query.page);
    const pageNumber = pageQuery ? pageQuery : 1;
    let noMatch = null;
    // let complaints = await Complaints.find().populate('userId').exec();

    if (searchFunction) {
        const searchAbility = new RegExp(escapeRegex(searchFunction), 'gi');
        const issue = searchAbility;

        Complaints.find().countDocuments({ issue })
            .then(c => {
                totalItems = c;
                return Complaints.find({ issue })
                    .populate('userId')
                    .skip((perPage * pageNumber) - perPage)
                    .limit(perPage)
                    .sort({ createdAt: -1 })
            })
            .then(c => {
                if (c.length < 1) {
                    noMatch = 'Sila cari semula!';
                }
                try {
                    res.render('main/aduan/index', {
                        pageTitle,
                        complaints: c,
                        currentUser: req.user,
                        current: pageNumber,
                        pages: Math.ceil(totalItems / perPage),
                        noMatch,
                        search: searchFunction,
                        itemCounts: totalItems
                    });
                } catch (err) {
                    console.log(err);
                }
            }).catch(err => {
                console.log('Error dari promise that find issue: ' + err);
                req.flash('error', err.message);
                res.redirect('back');
            });
    } else {
        Complaints.find().countDocuments({})
            .then(c => {
                totalItems = c;
                return Complaints.find({})
                    .populate('userId')
                    .skip((perPage * pageNumber) - perPage)
                    .limit(perPage)
                    .sort({ createdAt: -1 })
            })
            .then(c => {
                if (c.length < 1) {
                    noMatch = 'Sila cari semula!';
                }
                try {
                    res.render('main/aduan/index', {
                        pageTitle,
                        complaints: c,
                        currentUser: req.user,
                        current: pageNumber,
                        pages: Math.ceil(totalItems / perPage),
                        noMatch,
                        search: false,
                        itemCounts: totalItems
                    });
                } catch (err) {
                    console.log(err);
                }
            }).catch(err => {
                console.log('Error dari promise that find issue: ' + err);
                req.flash('error', err.message);
                res.redirect('back');
            });
    }

};

exports.getAddComplaint = async (req, res, next) => {
    const pageTitle = 'Aduan Baru';

    try {
        res.render('main/aduan/new', {
            pageTitle,
            hasError: false,
            errorMsg: null,
            oldInput: {
                modul: "",
                issue: "",
                desc: "",
                priority: ""
            },
            boxColorValidate: []
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getSuccessComplaint = async (req, res, next) => {
    const pageTitle = 'Aduan Berjaya';
    let aduanId = await Complaints.findById(req.params.id).select('_id').exec();

    res.render('main/aduan/success', {
        pageTitle,
        aduanId: aduanId.id
    });
};

exports.postNewComplaint = async (req, res, next) => {

    upload(req, res, async (err) => {
        const modul = req.body.modul;
        const issue = req.body.issue;
        const desc = req.body.desc;
        const priority = req.body.priority;
        const status = req.body.status;

        let adminEmail = await User.findOne({ username: 'admin' }).select('email');

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            const complaints = await Complaints.find().exec();

            return res.status(422).render('main/aduan/new', {
                pageTitle: 'Isi semula aduan anda',
                complaints,
                hasError: true,
                complaints: {
                    modul: modul,
                    issue: issue,
                    desc: desc,
                    priority: priority
                },
                oldInput: {
                    modul: modul,
                    issue: issue,
                    desc: desc,
                    priority: priority
                },
                errorMsg: errors.array()[0].msg,
                boxColorValidate: errors.array()
            });
        };

        if (err) {
            return res.send(err);
        }

        let attach = req.file;
        if (typeof req.file !== 'undefined') {
            attach = '/uploads/aduan/' + req.file.filename;
            console.log(req.file);
        }

        if (status === 'true') {
            status = true;
        }
        if (status === 'false') {
            status = false;
        }

        const newComplaint = new Complaints({
            modul: modul,
            issue: issue,
            attach: attach,
            desc: desc,
            priority: priority,
            status: status,
            userId: req.user
        });

        await newComplaint.save().then(complaint => {
            req.flash('success', 'Aduan anda sedang diproses!');
            res.redirect('/aduan/' + complaint._id + '/success');
            // return transporter.sendMail({
            //     to: adminEmail.email,
            //     from: complaint.userId.email,
            //     subject: complaint.issue,
            //     html: complaint.desc
            // });
        })
            .catch(err => {
                console.log(err);
                req.flash('error', err.message);
                res.redirect('back');
            });
    });
};

exports.getReadComplaint = async (req, res, next) => {

    const complaintId = req.params.id;

    let complaint = await Complaints.findById(complaintId)
        .populate({
            path: 'reviews', // 1st level subdoc (get reviews)
            populate: {
                path: 'userId', // 2nd level subdoc (get users in reviews)
                select: 'emp_name'
            }
        })
        .populate('userId')
        .exec();
    let reviews = await Reviews.find().populate('userId').exec();

    let reviewPaginate = await Reviews.paginate({
        '_id': {
            $in: complaint.reviews
        }
    },
        {
            page: req.query.page || 1,
            limit: 10,
            sort: { createdAt: -1 }
        });
    reviewPaginate.page = Number(reviewPaginate.page);
    const pageTitle = complaint.issue;

    res.render('main/aduan/show', { pageTitle, complaint, reviews, paginate: reviewPaginate });

};

exports.postNewReviews = async (req, res, next) => {
    const complaintId = req.params.id;
    let adminEmail = await User.findOne({ username: 'admin' }).select('email');

    Complaints.findById(complaintId)
        .then(complaints => {
            Reviews.create(req.body.complaints, async function (err, reviews) {
                if (err) {
                    console.log('Error dari review routes: ' + err.message);
                    req.flash('error', err.message);
                    res.redirect('back');
                } else {
                    reviews.userId = req.user;
                    reviews.save();
                    complaints.reviews.push(reviews);
                    complaints.save();
                    await transporter.sendMail({
                        to: reviews.userId.email,
                        from: adminEmail.email,
                        subject: 'Aduan -' + complaints._id,
                        html: reviews.reviews
                    });
                    res.redirect('/aduan/' + complaints._id);
                }
            });
        })
        .catch(err => console.log(err));
};

exports.getEditComplaintStatus = async (req, res, next) => {
    const complaintId = req.params.id;

    let complaint = await Complaints.findById(complaintId)
        .populate({
            path: 'reviews', // 1st level subdoc (get reviews)
            populate: {
                path: 'userId', // 2nd level subdoc (get users in reviews)
                select: 'emp_name'
            }
        })
        .populate('userId')
        .exec();

    let reviews = await Reviews.find().populate('userId').exec();

    let reviewPaginate = await Reviews.paginate({
        '_id': {
            $in: complaint.reviews
        }
    },
        {
            page: req.query.page || 1,
            limit: 10,
            sort: { createdAt: -1 }
        });
    reviewPaginate.page = Number(reviewPaginate.page);
    const pageTitle = 'Tukar Status Aduan';

    res.render('main/aduan/edit', {
        pageTitle: pageTitle,
        complaint: complaint,
        reviews: reviews,
        paginate: reviewPaginate
    });

};   

exports.putEditComplaintStatus = async (req, res, next) => {
    const complaintId = req.params.id;
    const putComplaints = req.body.complaints;
    let complaint_status = req.body.complaints.status;

    Complaints.findByIdAndUpdate(complaintId, putComplaints, function(err, complaints) {
        if(err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('back');
        } else {
            if(complaint_status === 'true') {
                complaint_status = true;
            }
            if(complaint_status === 'false') {
                complaint_status = false;
            }
            req.flash('success', 'Aduan ini telah selesai.');
            res.redirect('/aduan/' + complaintId);
        }
    });
};