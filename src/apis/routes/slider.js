var express = require('express');
var router = express.Router();
var sliderController = require('./../controllers/Slider');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');


/* GET users listing. */
router.get('/home-slider', passport.isAuthenticated, sliderController.getHomeSlider);


module.exports = router;
