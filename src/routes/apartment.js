var express = require('express');
var router = express.Router();
var apartmentController = require('./../controllers/Apartment');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../middleware/apiPassport');


/* GET ab listing. */
router.get('/', passport.isAuthenticated, apartmentController.getIndex);

/* API get create new abg */
router.get('/create', passport.isAuthenticated, apartmentController.getCreate);

/* API create new abg */
router.post('/create', passport.isAuthenticated, apartmentController.postCreate);

/* Get view */
router.get('/view/:apartmentId', passport.isAuthenticated, apartmentController.getView);


module.exports = router;
