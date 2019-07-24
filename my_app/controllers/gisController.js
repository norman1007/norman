const fs = require('fs');
const path = require('path');
var arcgisRestGeocoding = require('@esri/arcgis-rest-geocoding');
var { geocode } = arcgisRestGeocoding;

exports.getInsertGis = async (req, res, next) => {
    const pageTitle = 'Peta';
    res.render('main/gis/index', {
        pageTitle
    });
};

exports.postInsertGis = async (req, res, next) => {
    geocode(req.body.location)
        .then((response) => {
            console.log(response.candidates[0].location);
            res.send(response.candidates[0].location); // => { x: -118.409, y: 33.943, spatialReference: ...  }
        });
}