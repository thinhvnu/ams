var express = require('express');
var router = express.Router();
var mediaController = require('./../controllers/Media');

/**
 * API keys and Passport configuration.
 */
const passport = require('./../../middleware/apiPassport');

/* API create new post */
router.post('/upload-image', mediaController.postUploadImage);

/* API upload file */
router.post('/upload-excel-file', mediaController.postUploadExcelFile);


module.exports = router;
