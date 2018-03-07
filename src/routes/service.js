var express = require('express');
var router = express.Router();
var ServiceController = require('../controllers/Service');

/* get all categories. */
router.get('/', ServiceController.getIndex);
router.get('/create', ServiceController.getCreate);
router.post('/create', ServiceController.postCreate);

module.exports = router;
