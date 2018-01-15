var express = require('express');
var router = express.Router();
var chatController = require('./../controllers/Chat');

/**
 * Passport
 */
const passport = require('./../../middleware/apiPassport');

/* GET users listing. */
router.get('/clients', passport.isAuthenticated, chatController.getClients);

/* GET message listing. */
/***
 * params: room=${room}
 */
router.get('/messages/:roomId', passport.isAuthenticated, chatController.getMessages);


module.exports = router;
