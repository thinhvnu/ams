var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var flash = require('express-flash');
var mongoose = require('mongoose');
var dotenv = require('dotenv');

/*=== Passport ===*/
const passport = require('./src/middleware/passport');

/*=== Load config ===*/
var config = require('./config/main');

dotenv.config({path: '.env'});

const dashboard = require('./src/routes/dashboard');
const user = require('./src/routes/user');
const role = require('./src/routes/role');
const room = require('./src/routes/room');
const slider = require('./src/routes/slider');
const media = require('./src/routes/media');
const abg = require('./src/routes/apartmentBuildingGroup');
const ab = require('./src/routes/apartmentBuilding');
const service = require('./src/routes/service');
const permission = require('./src/routes/permission');

const apiMedia = require('./src/apis/routes/media');
const apiAuth = require('./src/apis/routes/authenticate');
const apiChat = require('./src/apis/routes/chat');
const apiSlider = require('./src/apis/routes/slider');
const apiPost = require('./src/apis/routes/post');
const apiUser = require('./src/apis/routes/user');
const apiComment = require('./src/apis/routes/comment');
const apiService = require('./src/apis/routes/service');

var app = express();
var io = require('socket.io')();
var ioEvents = require('./src/socket/server')(io);
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
// Use session
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET, // realtime chat system
}));
// User flash data
app.use(flash());

// Pass user login to client
app.use((req, res, next) => {
  // Allow request from all domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.locals.user = req.session.user;
  next();
});

app.use('/libs', express.static(__dirname + '/node_modules/'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', dashboard);
app.use('/user', user);
app.use('/role', role);
app.use('/room', room);
app.use('/slider', slider);
app.use('/media', media);
app.use('/apartment-building-group', abg);
app.use('/apartment-building', ab);
app.use('/service', service);
app.use('/permission', permission);

/**
 * Api router
 */
app.use('/api/media', apiMedia);
app.use('/api/auth', apiAuth);
app.use('/api/chat', apiChat);
app.use('/api/slider', apiSlider);
app.use('/api/post', apiPost);
app.use('/api/comment', apiComment);
app.use('/api/user', apiUser);
app.use('/api/service', apiService);

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

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
