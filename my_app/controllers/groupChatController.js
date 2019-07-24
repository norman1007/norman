const fs = require('fs');
const path = require('path');

const Printer = require('pdfmake');

const { validationResult } = require('express-validator/check');

const Kewpa3 = require('../models/kewpa3');
const Discussions = require('../models/discussions');

exports.postGroupDiscussions = async (req, res, next) => {
    const assetId = req.params.id;

    Kewpa3.findById(assetId)
        .then(asset => {
            Discussions.create(req.body.discussions, function(err, discussions) {
                if(err) {
                    console.log(err);
                    req.flash('error', err.message);
                    res.redirect('back');
                } else {
                    discussions.sender = req.user._id;
                    discussions.body = req.body.message;
                    discussions.name = req.body.groupId;
                    discussions.image = req.body.senderPhoto;
                    discussions.save();
                    asset.discussions.push(discussions);
                    asset.save();
                    //console.log(discussions);
                    res.redirect('/index/assets/' + assetId);
                }
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.postDeleteGroupChat = (req, res, next) => {
    const grpChtId = req.params.grpCht_id;

    Discussions.findByIdAndRemove(grpChtId, function(err) {
        if(err) {
            //console.log(err);
            req.flash('error', err.message);
            res.redirect('back');
        } else {
            res.redirect('/index/assets/' + req.params.id);
        }
    });
};