var express = require('express');
var router = express.Router();
var authenticateController = require('./../controllers/Authenticate');

/* GET users listing. */
router.post('/access-token', authenticateController.accessToken);


module.exports = router;
