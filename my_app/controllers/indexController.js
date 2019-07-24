const async = require('async');

// Express validator
const { validationResult } = require('express-validator/check');
// Create PDF
const sharp = require('sharp');

// Requiring User model
const User = require('../models/user');
const Kewpa3 = require('../models/kewpa3');
const Maintainances = require('../models/maintainances');
const Complaints = require('../models/complaints');
const PegawaiAset = require('../models/assetsOfficer');
const PegawaiKend = require('../models/appointing_maintainance');

// Requiring Suppliers model
const Suppliers = require('../models/suppliers');

exports.getIndex = async (req, res, next) => {
    const pageTitle = 'Laman Utama';

    const maintainancesStat = await Kewpa3.aggregate([
        { $unwind: "$maintainances" },
        {
            $group: {
                _id: "$ast_reg",
                number: {$sum: "$maintainances.total"}
            }
        }
    ]).exec();

    res.render('main/index', {
        pageTitle, 
        maintainancesStat
    });
};

// Admin Page
exports.adminPage = async (req, res, next) => {
    const pageTitle = 'Admin';

    let userList = await User.find().exec();

    try {
        res.render('admin/adminPage/index', {
            pageTitle,
            userList
        });
    } catch(err) {
        console.log(err);
    }
};

exports.getUserData = async (req, res, next) => {
    const pageTitle = 'User Data';

    let userList = await User.find().exec();

    res.render('admin/adminPage/index', {
        pageTitle,
        userList
    });
};

// Lantikan Pegawai
exports.getConfiguration = async (req, res, next) => {

    let users = await User.find().select('emp_name').select('username').select('department').exec();
    let p_aset = await PegawaiAset.find().populate('p_aset_name');
    let p_kend = await PegawaiKend.find().populate('p_kend_name');

    res.render('main/configuration/index', {
        pageTitle: 'Konfigurasi',
        users,
        p_aset,
        p_kend
    });
};

exports.postAssetsOfficer = async (req, res, next) => {

    const p_aset_name = req.body.p_aset_name;

    const newAssetsOfficer = new PegawaiAset({
        p_aset_name: p_aset_name
    });
    newAssetsOfficer.p_aset_approve = true;

    await newAssetsOfficer.save().then(result => {
        req.flash('success', 'Anda telah melantik pegawai aset yang baru.');
        res.redirect('/configuration');
    })
        .catch(err => {
            console.log('Error dari: ' + postAssetsOfficer);
            req.flash('error', err.message);
            res.redirect('back');
        });
};

exports.deleteAssetOfficer = async (req, res, next) => {

    PegawaiAset.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('back');
        } else {
            console.log('Berjaya dipadam!');
            res.redirect('/configuration');
        }
    });

};

exports.postKendOfficer = async (req, res, next) => {

    const p_kend_name = req.body.p_kend_name;

    const newKendOfficer = new PegawaiKend({
        p_kend_name: p_kend_name
    });
    newKendOfficer.p_kend_approve = true;

    await newKendOfficer.save().then(result => {
        console.log(result);
        req.flash('success', 'Anda telah melantik pegawai kenderaan yang baru.');
        res.redirect('/configuration');
    })
    .catch(err => {
        console.log('Error dari: ' + postKendOfficer);
        req.flash('error', err.message);
        res.redirect('back');
    });

};

exports.deleteKendOfficer = async (req, res, next) => {

    PegawaiKend.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('back');
        } else {
            console.log('Berjaya dipadam.');
            res.redirect('/configuration');
        }
    });

};

exports.getPlay = async (req, res, next) => {

    const pageTitle = 'Main main';

    res.render('template/play.ejs', {
        pageTitle
    });
};

exports.getMyProfile = async (req, res, next) => {

    const thisUserId = req.params.id;
    let thisUser = await User.findById(thisUserId).exec();
    let assetsCount = await Kewpa3.find().countDocuments().where('userId').equals(thisUser._id);

    let assets = await Kewpa3.find()
        .populate('userId')
        .where('userId')
        .equals(thisUser._id)

    assets = await Kewpa3.paginate({
        '_id': {
            $in: assets
        }
    },
        {
            page: req.query.page || 1,
            limit: 10,
            sort: { createdAt: -1 }
        });
    assets.page = Number(assets.page);

    let complaints = await Complaints.find()
        .populate('userId')
        .where('userId')
        .equals(thisUser._id)

    complaints = await Complaints.paginate({
        '_id': {
            $in: complaints
        }
    },
        {
            page: req.query.page || 1,
            limit: 10,
            sort: { createdAt: -1 }
        });
    complaints.page = Number(complaints.page);

    try {
        res.render("main/user/show", {
            pageTitle: 'Profile ' + thisUser.username,
            user: thisUser,
            assets: assets,
            assetsCount,
            c: complaints
        });
    } catch (err) {
        console.log(err);
    }
};

exports.putEditMyProfile = async (req, res, next) => {
    const user = req.body.user;
    if (req.file) {
        const buffer = await sharp(req.file.buffer).resize({ width: 150, height: 150 }).png().toBuffer();
        User.findByIdAndUpdate(req.params.id, user, async function (err, user) {
            if (err) {
                console.log('Error dari update user: ' + err);
                req.flash('error', err.message);
                res.redirect('back');
            } else {
                req.user.image = buffer;
                await req.user.save();
                req.flash('success', 'Profile anda telah dikemaskini!');
                res.redirect('/profile-saya/' + req.params.id);
            }
        });
    } else {
        User.findByIdAndUpdate(req.params.id, user, async function (err, user) {
            if (err) {
                console.log('Error dari update user: ' + err);
                req.flash('error', err.message);
                res.redirect('back');
            } else {
                req.flash('success', 'Profile anda telah dikemaskini!');
                res.redirect('/profile-saya/' + req.params.id);
            }
        });
    }
};

// Serve profile image
exports.getProfileImage = async (req, res, next) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);

        if (!user || !user.image) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.image)
    } catch (e) {
        res.status(404).send()
    }
};

// Delete profile image
exports.postDeleteProfileImage = async (req, res, next) => {
    req.body.user.avatar = undefined;
    await req.body.user.avatar.save();
    res.redirect('/profile-saya/' + req.params.id);
};

// Get all suppliers 
exports.getAllSuppliers = async (req, res, next) => {
    const pageTitle = 'Senarai Pembekal';
    let suppliers = await Suppliers.find().populate('userId').exec();
    const suppliersCount = await Suppliers.find().countDocuments();

    suppliers = await Suppliers.paginate({}, {
        page: req.query.page || 1,
        limit: 20,
        sort: {
            createdAt: -1
        }
    });
    suppliers.page = Number(suppliers.page);

    // Make input validation 
    /* const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors.array());
        let suppliers = await Suppliers.find().populate('userId').exec();

        suppliers = await Suppliers.paginate({}, {
            page: req.query.page || 1,
            limit: 20,
            sort: {
                createdAt: -1
            }
        });
        suppliers.page = Number(suppliers.page);

        return res.status(422).render('main/suppliers/all', {
            pageTitle: 'Daftar semula pembekal',
            suppliers,
            suppliersCount,
            hasError: true,
            // suppliers: {
            //     supName: supplierName,
            //     supAddr: supplierAddr
            // },
            oldInput: {
                supName: supplierName,
                supAddr: supplierAddr
            },
            errorMsg: errors.array()[0].msg,
            boxColorValidate: errors.array()
        });
    } */

    try {
        res.render('main/suppliers/all', {
            pageTitle,
            suppliers,
            suppliersCount,
            hasError: false,
            errorMsg: null,
            oldInput: {
                supName: "",
                supAddr: ""
            },
            boxColorValidate: []
        });
    } catch (err) {
        console.log(err);
        res.end('Ralat...');
    }
};

exports.postChangeMyPassword = (req, res, next) => {
    const myPasswordId = req.params.id;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;

    User.findById(myPasswordId, (err, user) => {
        try {
            console.log(err);
            if (newPassword === confirmPassword) {
                user.setPassword(newPassword, function (err) {
                    user.save(function (err) {
                        req.login(user, function (err) {
                            res.redirect('/admin/login');
                        });
                    });
                });
            } else {
                req.flash('error', 'Katalaluan yang dimasukkan tidak sepadan.');
                return res.redirect('back');
            }
        } catch (err) {
            req.flash('error', err.message);
            res.redirect('back');
        }
    });
};

// Post add new suppliers
exports.postNewSupplier = async (req, res, next) => {
    const supplierName = req.body.supName;
    const supplierAddr = req.body.supAddr;
    const userId = {
        id: req.user._id,
        emp_name: req.user.emp_name,
        username: req.user.username,
        department: req.user.department
    }
    // Make input validation 
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors.array());
        let suppliers = await Suppliers.find().populate('userId').exec();
        const suppliersCount = await Suppliers.find().countDocuments();

        suppliers = await Suppliers.paginate({}, {
            page: req.query.page || 1,
            limit: 20,
            sort: {
                createdAt: -1
            }
        });
        suppliers.page = Number(suppliers.page);

        return res.status(422).render('main/suppliers/all', {
            pageTitle: 'Daftar semula pembekal',
            suppliers,
            suppliersCount,
            hasError: true,
            // suppliers: {
            //     supName: supplierName,
            //     supAddr: supplierAddr
            // },
            oldInput: {
                supName: supplierName,
                supAddr: supplierAddr
            },
            errorMsg: errors.array()[0].msg,
            boxColorValidate: errors.array()
        });
    }

    //  Register new supplier
    const suppliers = new Suppliers({
        supName: supplierName,
        supAddr: supplierAddr,
        userId: userId
    });
    await suppliers.save().then(execute => {
        console.log('Pembekal yang di daftarkan: ' + execute);
        req.flash('success', 'Pembekal baharu telah didaftarkan.');
        res.redirect('/pembekal');
    })
        .catch(err => {
            console.log('Ralat pada constructor mendaftar pembekal: ' + err);
            req.flash('error', 'Ralat pada constructor mendaftar pembekal: ' + err.message);
            res.redirect('back');
        });
};

// Delete one supplier
exports.postDeleteSupplier = (req, res, next) => {
    Suppliers.findByIdAndRemove(req.params.id, (err, supplier) => {
        if (err) {
            console.log('Ralat pada delete supplier: ' + err);
            req.flash('error', err.message);
        } else {
            console.log('Berjaya delete: ' + supplier);
            req.flash('success', 'Syarikat yang di daftar telah berjaya dipadam!');
            res.redirect('/pembekal');
        }
    });
};

