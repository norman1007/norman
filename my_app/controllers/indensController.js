const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator/check');

const Kewpa3 = require('../models/kewpa3');
const Indens = require('../models/indens');
const User = require('../models/user');

exports.postAddInden = async (req, res, next) => {
    const assetId = req.params.id;

    Kewpa3.findById(assetId)
        .then(asset => {
            console.log(req.body.indens);
            Indens.create(req.body.indens, function (err, indens) {
                if (err) {
                    console.log('Error dari indens routes ' + err.message); 
                    res.flash('error', err.message);
                    res.redirect('back');
                } else {
                    indens.userId = req.user;
                    indens.save();
                    asset.indens.push(indens);
                    asset.save();
                    res.redirect('/index/assets/' + asset._id);
                }
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.postDeleteInden = async (req, res, next) => {
    const indenId = req.params.inden_id;

    Indens.findByIdAndRemove(indenId, function(err) {
        if(err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('back');
        } else {
            res.redirect(`/index/assets/${req.params.id}`);
        }
    });

};