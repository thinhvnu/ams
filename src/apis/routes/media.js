var express = require('express');
var router = express.Router();
var mediaController = require('./../controllers/Media');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');

/* API create new post */
router.post('/upload-image', mediaController.postUploadImage);


module.exports = router;
