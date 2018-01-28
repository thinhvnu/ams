var express = require('express');
var router = express.Router();
var abgController = require('./../controllers/ApartmentBuildingGroup');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../middleware/apiPassport');


/* GET abg listing. */
router.get('/', passport.isAuthenticated, abgController.getIndex);

/* API get create new abg */
router.get('/create', passport.isAuthenticated, abgController.getCreate);

/* API create new abg */
router.post('/create', passport.isAuthenticated, abgController.postCreate);

/* Get view */
router.get('/view/:abgId', passport.isAuthenticated, abgController.getView);


module.exports = router;
