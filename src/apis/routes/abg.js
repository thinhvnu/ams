var express = require('express');
var router = express.Router();
var abgController = require('./../controllers/Abg');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');


/* GET list building. */
router.get('/list-building/:abgId', abgController.getListBuilding);

module.exports = router;
