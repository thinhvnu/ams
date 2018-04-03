var express = require('express');
var router = express.Router();
var buildingController = require('./../controllers/Building');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');

/* GET list building. */
router.get('/list-apartment/:buildingId', buildingController.getListApartment);

router.post('/add-new-apartment', passport.isAuthenticated, buildingController.postAddNewApartment);

module.exports = router;
