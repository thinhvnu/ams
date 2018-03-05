var express = require('express');
var router = express.Router();
var abController = require('./../controllers/ApartmentBuilding');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../middleware/apiPassport');


/* GET ab listing. */
router.get('/', passport.isAuthenticated, abController.getIndex);

/* API get create new abg */
router.get('/create', passport.isAuthenticated, abController.getCreate);

/* API create new abg */
router.post('/create', passport.isAuthenticated, abController.postCreate);

/* Get view */
router.get('/view/:abId', passport.isAuthenticated, abController.getView);


module.exports = router;
