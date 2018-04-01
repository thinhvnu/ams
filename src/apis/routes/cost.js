var express = require('express');
var router = express.Router();
var CostController = require('./../controllers/Cost');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');


/* POST submit data. */
router.post('/submit-data', passport.isAuthenticated, CostController.postSubmitData);
router.get('/apartment-cost', passport.isAuthenticated, CostController.getApartmentCost);

module.exports = router;
