const Kewpa3 = require('../models/kewpa3');
const Placements = require('../models/placements');
const User = require('../models/user');

const { validationResult } = require('express-validator/check');

exports.postPlacements = async (req, res, next) => {
    const asetId = req.params.id;
    const offName = req.body.placements.offName;
    const plcDate = req.body.placements.plcDate;
    const loc = req.body.placements.loc;

    // let asset = await Kewpa3.findOne({ slugAsset: req.params.slugAsset })
    let asset = await Kewpa3.findById(asetId)
        .populate('userId')
        .populate('sup')
        .exec();
    let users = await User.find().exec();
    let placements = await Placements.find().exec();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Error dari postPlacements: ' + errors.array());
        let placements = await Placements.find().exec();

        return res.status(422).render('main/assets/show', {
            pageTitle: 'Daftar semula penempatan pegawai',
            asset,
            users,
            placements,
            hasError: true,
            // placements: {
            //     offName: offName,
            //     plcDate: plcDate,
            //     loc: loc
            // },
            // oldInput: {
            //     offName: offName,
            //     plcDate: plcDate,
            //     loc: loc
            // },
            errorMsg: errors.array()[0].msg,
            boxColorValidate: errors.array()
        });
    }

    Kewpa3.findById(asetId)
        .then(assets => {
            Placements.create(req.body.placements, (err, placements) => {
                if (err) {
                    console.log('Error dari postPlacements: ' + err);
                    req.flash('error', err.message);
                    res.redirect('back');
                } else {
                    placements.save();
                    assets.placements.push(placements);
                    assets.save();
                    res.redirect('/index/assets/' + assets._id);
                }
            });
        })
        .catch(err => {
            console.log('Error dari postPlacements Promise: ' + err);
        });
};

exports.postDeletePlacements = async (req, res, next) => {
    const plcId = req.params.plcId;

    Placements.findByIdAndRemove(plcId, function (err) {
        if (err) {
            console.log('Error dari postDeletePlacements: ' + err);
            req.flash('error', err.message);
            res.redirect('back')
        } else {
            res.redirect('/index/assets');
        }
    });
};