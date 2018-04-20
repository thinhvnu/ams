var express = require('express');
var router = express.Router();
var FeedbackController = require('../controllers/FeedBack');

/* get all categories. */
router.get('/', FeedbackController.getIndex);

module.exports = router;
