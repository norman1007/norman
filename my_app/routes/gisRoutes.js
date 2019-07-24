const path = require('path');
const express = require('express');
const router = express.Router();
const middleware = require('../middleware/auth/authMiddleware');
var arcgisRestGeocoding = require('@esri/arcgis-rest-geocoding');
var { geocode } = arcgisRestGeocoding;

const { check, body } = require('express-validator/check');
const User = require('../models/user');
const Kewpa3 = require('../models/kewpa3');

const gisController = require('../controllers/gisController');

router.get('/geocode', gisController.getInsertGis);
// router.get('/geocode', function(req, res, next) {
//     geocode(req.query.location)
//       .then((response) => {
//         res.send(response.candidates[0].location); // => { x: -118.409, y: 33.943, spatialReference: ...  }
//       });
//   })

router.post('/geocode', gisController.postInsertGis);

module.exports = router;