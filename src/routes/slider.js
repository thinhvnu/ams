var express = require('express');
var router = express.Router();
var SliderController = require('../controllers/Slider');

/* get all categories. */
router.get('/', SliderController.getIndex);
router.get('/create', SliderController.getCreate);
router.post('/create', SliderController.postCreate);

module.exports = router;