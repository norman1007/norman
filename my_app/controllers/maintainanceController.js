const fs = require('fs');
const path = require('path');
const Printer = require('pdfmake');

const { validationResult } = require('express-validator/check');
const Kewpa3 = require('../models/kewpa3');
const Maintainances = require('../models/maintainances');
const User = require('../models/user');

exports.getAssetMaintainance = async (req, res, next) => {
    const assetId = req.params.id;
    const pageTitle = 'Bahagian Selenggara Aset';
    
    let asset = await Kewpa3.findById(assetId).exec();
    let users = await User.find().exec();

    res.render('main/maintainance/new', { pageTitle, asset, users });
};

exports.postAssetMaintainance = async (req, res, next) => {
    const assetId = req.params.id;
    Kewpa3.findById(assetId)
        .then(asset => {
            console.log(req.body.maintainance);
            Maintainances.create(req.body.maintainances, function(err, maintainances) {
                if(err) {
                    console.log('Error dari maintainances routes: ' + err.message);
                    req.flash('error', err.message);
                    res.redirect('back');
                } else {
                    maintainances.userId = req.user;
                    maintainances.save();
                    asset.maintainances.push(maintainances);
                    asset.save();
                    // console.log('Data selenggara: ' + maintainances);
                    res.redirect('/index/assets/' + asset._id);
                }
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.postDeleteMaintainance = async (req, res, next) => {
    const mtncId = req.params.mtnc_id;

    Maintainances.findByIdAndRemove(mtncId, function(err) {
        if(err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('back');
        } else {
            res.redirect(`/index/assets/${req.params.id}`);
        }
    });
};

exports.getTemplate = async (req, res, next) => {
    const assetId = req.params.id;
    const pageTitle = 'Template Example';

    let asset = await Kewpa3.findById(assetId).exec();

    res.render('main/maintainance/template', { pageTitle, asset });
};