var express = require('express');
var router = express.Router();
var PermissionController = require('../controllers/Permission');

/* get all categories. */
router.get('/', PermissionController.getIndex);
router.get('/create', PermissionController.getCreate);
router.post('/create', PermissionController.postCreate);

module.exports = router;
