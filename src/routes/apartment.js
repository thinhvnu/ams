var express = require('express');
var router = express.Router();
var apartmentController = require('./../controllers/Apartment');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../middleware/passport');


/* GET ab listing. */
router.get('/', passport.isAuthenticated, apartmentController.getIndex);

/* API get create new abg */
router.get('/create', passport.isAuthenticated, apartmentController.getCreate);

/* API create new abg */
router.post('/create', passport.isAuthenticated, apartmentController.postCreate);

/* API get edit abg */
router.get('/edit/:apartmentId', passport.isAuthenticated, apartmentController.getEdit);

/* API post update abg */
router.post('/update/:apartmentId', passport.isAuthenticated, apartmentController.postUpdate);

/* Get view */
router.get('/view/:apartmentId', passport.isAuthenticated, apartmentController.getView);

router.get('/delete/:apartmentId', passport.isAuthenticated, apartmentController.getDelete);


module.exports = router;
