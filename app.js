var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var sharedsession = require("express-socket.io-session");
var flash = require('express-flash');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var dotenv = require('dotenv');

/*=== Passport ===*/
const passport = require('./src/middleware/passport');

/*=== Load config ===*/
var config = require('./config/main');

dotenv.config({path: '.env'});

const dashboard = require('./src/routes/dashboard');
const user = require('./src/routes/user');
const room = require('./src/routes/room');
const slider = require('./src/routes/slider');
const media = require('./src/routes/media');
const abg = require('./src/routes/apartmentBuildingGroup');
const ab = require('./src/routes/apartmentBuilding');
const apartment = require('./src/routes/apartment');
const postCategory = require('./src/routes/post-category');
const serviceCategory = require('./src/routes/service-category');
const service = require('./src/routes/service');
const serviceRequest = require('./src/routes/service-request');
const cost = require('./src/routes/cost');
const costType = require('./src/routes/costType');
const utilityCategory = require('./src/routes/utility-category');
const utility = require('./src/routes/utility');
const staticPage = require('./src/routes/static-page');
const permission = require('./src/routes/permission');
const notification = require('./src/routes/notification');
const payment = require('./src/routes/payment');
const chatGroup = require('./src/routes/chat-group');
const feedback = require('./src/routes/feedback');

const apiMedia = require('./src/apis/routes/media');
const apiAuth = require('./src/apis/routes/authenticate');
const apiChat = require('./src/apis/routes/chat');
const apiAbg = require('./src/apis/routes/abg');
const apiBuilding = require('./src/apis/routes/building');
const apiApartment = require('./src/apis/routes/apartment');
const apiSlider = require('./src/apis/routes/slider');
const apiPost = require('./src/apis/routes/post');
const apiUser = require('./src/apis/routes/user');
const apiComment = require('./src/apis/routes/comment');
const apiLike = require('./src/apis/routes/like');
const apiService = require('./src/apis/routes/service');
const apiUtility = require('./src/apis/routes/utility');
const apiStaticPage = require('./src/apis/routes/static-page');
const apiNotification = require('./src/apis/routes/notification');
const apiFeedBack = require('./src/apis/routes/feedback');
const apiCost = require('./src/apis/routes/cost');

var app = express();
var io = require('socket.io')();
var ioEvents = require('./src/socket/server')(io);
// app.io = io;
app.locals.moment = require('moment-timezone');

// view engine setup
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(expressValidator());
app.use(cookieParser());
// Use session
var sessionMiddleware = session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET, // realtime chat system
  store: new MongoStore({
    url: process.env.DB_ADDRESS,
    autoReconnect: true,
  })
});
io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});
app.use(sessionMiddleware);
// io.use(sharedsession(ss, {
//   autoSave:true
// })); 
// User flash data
app.use(flash());

// Pass user login to client
app.use((req, res, next) => {
  // Allow request from all domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.locals.user = req.session.user;
  // global.io.session = req.session;
  // global.io.sessionID = req.sessionID;
  next();
});

app.use('/libs', express.static(__dirname + '/node_modules/'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', dashboard);
app.use('/user', user);
app.use('/room', room);
app.use('/slider', slider);
app.use('/media', media);
app.use('/apartment-building-group', abg);
app.use('/apartment-building', ab);
app.use('/apartment', apartment);
app.use('/service', service);
app.use('/service-request', serviceRequest);
app.use('/cost', cost);
app.use('/cost-type', costType);
app.use('/post-category', postCategory);
app.use('/service-category', serviceCategory);
app.use('/utility-category', utilityCategory);
app.use('/utility', utility);
app.use('/static-page', staticPage);
app.use('/permission', permission);
app.use('/notification', notification);
app.use('/payment', payment);
app.use('/chat-group', chatGroup);
app.use('/feedback', feedback);

/**
 * Api router
 */
app.use('/api/media', apiMedia);
app.use('/api/auth', apiAuth);
app.use('/api/chat', apiChat);
app.use('/api/abg', apiAbg);
app.use('/api/building', apiBuilding);
app.use('/api/apartment', apiApartment);
app.use('/api/slider', apiSlider);
app.use('/api/post', apiPost);
app.use('/api/like', apiLike);
app.use('/api/comment', apiComment);
app.use('/api/user', apiUser);
app.use('/api/service', apiService);
app.use('/api/utility', apiUtility);
app.use('/api/page', apiStaticPage);
app.use('/api/notification', apiNotification);
app.use('/api/feedback', apiFeedBack);
app.use('/api/cost', apiCost);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Connect to mongo database
mongoose.connect(process.env.DB_ADDRESS, function(err, db) {
  if (err) {
    console.log('error connect db', err);
  } else {
    console.log('Mongo database is connected')
  }
})

process.on('uncaughtException', function(e) {
  console.log('An error has occured. error is: %s and stack trace is: %s', e, e.stack);
  console.log("Process will restart now.");
  process.exit(1);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

global.io = io;

module.exports = app;
