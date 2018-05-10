const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('./../../models/User');

/**
 * Passport
 */
const passport = require('./../../middleware/passport');

/**
 * POST username/password and server gen accesstoken using for login
 * Sign in using username and password.
 */
exports.accessToken = (req, res, next) => {
  try {
    req.checkBody('userName', 'UserName cannot be blank').notEmpty();
    req.checkBody('password', 'Password cannot be blank').notEmpty();

    req.getValidationResult().then(function(errors) {
      if (!errors.isEmpty()) {
        /**
         * Case error login
         */
        return res.json({
            success: false,
            errorCode: '001',
            message: 'Tên đăng nhập và mật khẩu không được để trống'
        })
      } else {
        User.findOne({
          userName: req.body.userName
        }, (err, user) => {
          try {
            if (!user) {
              return res.json({ success: false, errorCode: 002, message: 'Tài khoản không tồn tại' });
            } else {
              /**
               * Case user inactive
               */
              if (user.status === 0) {
                return res.json({
                    success: false,
                    errorCode: '002',
                    message: 'Tài khoản chưa kích hoạt'
                })
              }
              // check if password matches
              user.comparePassword(req.body.password, (err, isMatch) => {
                try {
                  if (err) { 
                    return res.json({
                      success: false,
                      errorCode: '121',
                      message: 'Lỗi không xác định'
                    })
                  }
                  if (isMatch) {
                    req.session.user = user;
                    res.locals.user = user;
                    /**
                     * Using json web token gen token for client
                     */
                    var token = passport.jwtCreateToken({userId: user.id});
                    // res.cookie('rtcs_chat_token', token, { httpOnly: false});
                    return res.json({
                        success: true,
                        errorCode: 0,
                        token: token,
                        message: 'Get access token successfully'
                    });
                  } else {
                    return res.json({ success: false, code: 3, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
                  }
                } catch (e) {
                  return res.json({
                    success: false,
                    errorCode: 111,
                    message: 'Error'
                  })
                }
              })
            }
          } catch (e) {
            return res.json({
              success: false,
              errorCode: 111,
              message: 'Error'
            })
          }
        })
      }
    })
  } catch (e) {
    return res.json({
      success: false,
      errorCode: 111,
      message: 'Error'
    })
  }
};