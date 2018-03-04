const express = require('express');
const router = express.Router();
const SliderController = require('../controllers/Slider');

/**
 * API keys and Passport configuration.
 */
const passport = require('../middleware/passport');

/* get all categories. */
router.get('/', passport.isAuthenticated, SliderController.getIndex);
router.get('/create', passport.isAuthenticated, SliderController.getCreate);
router.post('/create', passport.isAuthenticated, SliderController.postCreate);
router.get('/edit/:sliderId', passport.isAuthenticated, SliderController.getEdit);
router.post('/update/:sliderId', passport.isAuthenticated, SliderController.postUpdate);
router.get('/delete/:sliderId', passport.isAuthenticated, SliderController.getDelete)

module.exports = router;