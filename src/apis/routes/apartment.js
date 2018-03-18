var express = require('express');
var router = express.Router();
var apartmentController = require('./../controllers/Apartment');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');


/* GET list building. */
router.post('/add-new-user', apartmentController.postAddNewUser);
router.post('/add-exist-user', apartmentController.postAddExistUser);

module.exports = router;
