var express = require('express');
var router = express.Router();
var buildingController = require('./../controllers/Building');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');

router.post('/add-new-apartment', passport.isAuthenticated, buildingController.postAddNewApartment);

module.exports = router;
