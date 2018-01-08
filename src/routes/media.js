var express = require('express');
var router = express.Router();
var MediaController = require('../controllers/Media');

/* Post froala Upload Image. */
router.post('/upload_image', MediaController.postFroalaUploadImage);
router.get('/load_images', MediaController.getFroalaLoadImages);

router.get('/upload-image', MediaController.getUploadImage);
router.post('/upload-image', MediaController.postUploadImage);

module.exports = router;
