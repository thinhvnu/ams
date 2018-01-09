var express = require('express');
var router = express.Router();
var sliderController = require('./../controllers/Slider');

/* GET users listing. */
router.get('/home-slider', sliderController.getHomeSlider);


module.exports = router;
