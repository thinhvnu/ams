const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const roles = require('../libs/roles');
const User = require('../models/User');
const Apartment = require('../models/Apartment');
const ApartmentBuildingGroup = require('../models/ApartmentBuildingGroup');
const ApartmentBuilding = require('../models/ApartmentBuilding');
const Notification = require('../models/Notification');

var abgs = [], abs = [];

/**
 * Passport
 */
const passport = require('./../middleware/apiPassport');

/**
 * GET /
 * Index page.
 */
exports.getIndex = (req, res) => {
  User.find({})
    .sort('-createdAt')
    .exec(function (err, users) {
      if (err) {
        console.log('err', err)
        return res.json({
          success: false,
          errorCode: '121',
          message: 'Lỗi không xác định'
        })
      }

      res.render('user/index', {
        title: 'Account List',
        current: ['user', 'index'],
        users: users
      });
    });
};

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('user/login', {
    title: 'Login'
  });
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  console.log(req.body.email);
  req.checkBody('email', 'Email is invalid').isEmail();
  req.checkBody('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });
  console.log('redirectTo', req.session.redirectTo);
  req.getValidationResult().then(function (errors) {
    if (!errors.isEmpty()) {
      var errors = errors.mapped();
      res.render('user/login', {
        title: 'Login',
        errors: errors,
        data: req.body
      });
    } else {
      User.findOne({
        email: req.body.email
      }, (err, user) => {
        if (err) throw err;
        if (!user) {
          req.flash('errors', 'Authentication failed. User not found.');
          return res.redirect('/user/login');
        } else {
          // check if password matches
          user.comparePassword(req.body.password, (err, isMatch) => {
            if (err) {
              return res.json({
								success: false,
								errorCode: '121',
								message: 'Lỗi không xác định'
							})
            }
            if (isMatch) {
              /**
               * Using json web token gen token for client
               */
              var token = passport.jwtCreateToken({
                userId: user.id
              }), accessRouter = req.originalUrl;
              res.cookie(process.env.TOKEN_KEY, token, { maxAge: process.env.LOGIN_TOKEN_EXP, httpOnly: false});
              return res.redirect(req.session.redirectTo || '/');
            } else {
              return res.redirect('/user/login');
            }
          })
        }
      })
    }
  })
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  // req.logout();
  req.session.destroy();
  res.cookie(process.env.TOKEN_KEY, '', { httpOnly: false });
  res.redirect('/');
};

/**
 * GET /signup
 * Signup page.
 */
exports.getCreate = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  ApartmentBuildingGroup.find({status: 1}).exec((err, abgs) => {
    res.render('user/create', {
      current: ['user', 'create'],
      title: 'Create Account',
      roles: roles.list,
      abgs: abgs
    });
  })
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postCreate = (req, res, next) => {
  try {
    req.checkBody('firstName', 'Nhập họ tên').notEmpty();
    req.checkBody('lastName', 'Nhập họ tên').notEmpty();
    req.checkBody('phoneNumber', 'Nhập số điện thoại').notEmpty();
    req.checkBody('phoneNumber', 'Số điện thoại không đúng định dạng').matches(/(08|09|01[2|6|8|9])+([0-9]{8})/);
    req.checkBody('role', 'Chọn quyền').notEmpty();
    req.checkBody('password', 'Mật khẩu ít nhất 6 kí tự').len(6);
    req.checkBody('confirmPassword', 'Xác nhận mật khẩu không trùng khớp').equals(req.body.password);
    if (req.body.role != 'ADMIN') {
      req.checkBody('apartmentBuildingGroup', 'Chọn chung cư').notEmpty();
      req.checkBody('apartmentBuilding', 'Chọn tòa nhà').notEmpty();
    }
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });
    console.log('testtttt', req.body);
    req.getValidationResult().then(function (errors) {
      if (!errors.isEmpty()) {
        var errors = errors.mapped();
        console.log('errors', errors);
        ApartmentBuildingGroup.find({status: 1}).exec((err, abgs) => {
          ApartmentBuilding.find({apartmentBuildingGroup: req.body.apartmentBuildingGroup}).exec((err, abs) => {
            Apartment.find({building: req.body.apartmentBuilding}).exec((err, apartments) => {
              res.render('user/create', {
                current: ['user', 'create'],
                data: req.body,
                roles: roles.list,
                abgs: abgs || [],
                abs: abs || [],
                apartments: apartments || [],
                errors: errors
              })
            })
          })
        });
      } else {
        const user = new User();
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.userName = req.body.userName || req.body.phoneNumber;
        user.email = req.body.email;
        user.avatar = req.body.avatar;
        user.phoneNumber = req.body.phoneNumber;
        user.password = req.body.password;
        user.apartment = req.body.apartment || null;
        user.building = req.body.apartmentBuilding || null;
        user.buildingGroup = req.body.apartmentBuildingGroup || null;
        user.gender = req.body.gender;
        user.role = req.body.role;
        user.status = req.body.status;
        console.log('new user', user);
        User.findOne({ phoneNumber: req.body.phoneNumber }, (err, existingUser) => {
          if (err) { 
            console.log('err', err);
            return next(err);
          }
          if (existingUser) {
            req.flash('errors', 'Account with that email address already exists.');
            return res.redirect('/user');
          }
          user.save((err, u) => {
            if (err) {
              console.log('error create new user', err);
              return next(err);
            }
            Apartment.findById(u.apartment).exec((err, a) => {
              if (a) {
                if (!a.users) {
                  a.users = [];
                }
                a.users.pull(u._id);
                a.users.push(u._id);
                a.save((err) => {
                })
              } else {
                
              }
            })
            res.redirect('/user');
          });
        });
      }
    });
  } catch (e) {
    console.log('exception', e);
    return res.render('/error', {
      data: e
    });
  }
};

/**
 * Get edit account
 */
exports.getEdit = (req, res, next) => {
  try {
    let userId = req.params.userId;

    if (req.query.notiId) {
      Notification.findById(req.query.notiId).exec((err, notification) => {
        if (notification) {
          notification.status = 1;
          notification.save();
        }
      })
    }

    User.findById(userId)
      .exec((err, user) => {
        ApartmentBuildingGroup.find({
          status: 1
        }).exec((err, abgs) => {
          ApartmentBuilding.find({apartmentBuildingGroup: user.buildingGroup}).exec((err, abs) => {
            Apartment.find({building: user.building}).exec((err, apartments) => {
              res.render('user/edit', {
                current: ['user', 'exit'],
                data: user,
                roles: roles.list,
                abgs: abgs,
                abs: abs,
                apartments: apartments
              })
            })
          })
        })
      })
  } catch(e) {
    req.flash('errors', 'Có lỗi xảy ra');
    return res.redirect('/user')
  }
}

/**
 * Get edit account
 */
exports.postUpdate = (req, res, next) => {
  req.checkBody('firstName', 'Nhập họ tên').notEmpty();
  req.checkBody('lastName', 'Nhập họ tên').notEmpty();
  req.checkBody('phoneNumber', 'Nhập số điện thoại').notEmpty();
  req.checkBody('role', 'Chọn quyền').notEmpty();
  if (req.body.role != 'ADMIN') {
    req.checkBody('apartmentBuildingGroup', 'Chọn chung cư').notEmpty();
    req.checkBody('apartmentBuilding', 'Chọn tòa nhà').notEmpty();
  }
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  req.getValidationResult().then(function(errors) {
    if (!errors.isEmpty()) {
      let errs = errors.array();
      req.flash('errors', errs[0].msg);
      return res.redirect('/user/edit/' + req.params.userId);
    }
    User.findById(req.params.userId, (err, user) => {
      if (err) {
        req.flash('errors', 'Đã xảy ra lỗi trong quá trình cập nhật. Vui lòng thử lại');
        console.log('err', err);
        return res.redirect('/user/edit/' + req.params.userId);
      }
  
      if (user) {
        Apartment.findById(user.apartment).exec((err, apartment) => {
          if (apartment && apartment.users) {
            apartment.users.pull(user._id);
            apartment.save();
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.avatar = req.body.avatar;
            user.phoneNumber = req.body.phoneNumber;
            user.role = req.body.role;
            user.email = req.body.email;
            user.gender = req.body.gender;
            user.status = req.body.status;
            user.apartment = req.body.apartment || null;
            user.building = req.body.apartmentBuilding;
            user.buildingGroup = req.body.apartmentBuildingGroup;
            // save the user
            user.save(function (err, u) {
              if (err) {
                console.log('err', err);
                req.flash('errors', 'Đã xảy ra lỗi trong quá trình cập nhật. Vui lòng thử lại')
                return res.redirect('/user/edit/' + req.params.userId);
              }

              Apartment.findById(u.apartment).exec((err, a) => {
                if (a) {
                  if (!a.users) {
                    a.users = [];
                  }
                  a.users.pull(u._id);
                  a.users.push(u._id);
                  a.save((err) => {
                    req.flash('success', 'Cập nhật thành công ' + u.firstName + ' ' + u.lastName);
                    // Insert child to category
                    return res.redirect('/user');
                  })
                } else {
                  req.flash('success', 'Cập nhật thành công ' + u.firstName + ' ' + u.lastName);
                  // Insert child to category
                  return res.redirect('/user');
                }
              })
            });
          } else {
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.avatar = req.body.avatar;
            user.phoneNumber = req.body.phoneNumber;
            user.role = req.body.role;
            user.email = req.body.email;
            user.gender = req.body.gender;
            user.status = req.body.status;
            user.apartment = req.body.apartment || null;
            user.building = req.body.apartmentBuilding;
            user.buildingGroup = req.body.apartmentBuildingGroup;
            // save the user
            user.save(function (err, u) {
              if (err) {
                console.log('err', err);
                req.flash('errors', 'Đã xảy ra lỗi trong quá trình cập nhật. Vui lòng thử lại')
                return res.redirect('/user/edit/' + req.params.userId);
              }
      
              Apartment.findById(u.apartment).exec((err, a) => {
                if (a) {
                  if (!a.users) {
                    a.users = [];
                  }
                  a.users.pull(u._id);
                  a.users.push(u._id);
                  a.save((err) => {
                    req.flash('success', 'Cập nhật thành công ' + u.firstName + ' ' + u.lastName);
                    // Insert child to category
                    return res.redirect('/user');
                  })
                } else {
                  // req.flash('errors', 'Không tìm thấy dữ liệu')
                  req.flash('success', 'Cập nhật thành công ' + u.firstName + ' ' + u.lastName);
                  return res.redirect('/user');
                }
              })
            });
          }
        })
      } else {
        req.flash('errors', 'Không tìm thấy dữ liệu')
        return res.redirect('/user');
      }
    })
  })
}

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
  res.render('account/profile', {
    title: 'Account Management'
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.email = req.body.email || '';
    user.profile.name = req.body.name || '';
    user.profile.gender = req.body.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
          return res.redirect('/account');
        }
        return next(err);
      }
      req.flash('success', { msg: 'Profile information has been updated.' });
      res.redirect('/account');
    });
  });
};

exports.getChangePassword = (req, res, next) => {
  User.findById(req.params.userId).exec((err, user) => {
    res.render('user/change-password', {
      data: user
    })
  })
}

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long').len(6);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', 'Mật khẩu không khớp hoặc không hợp đủ 6 ký tự');
    return res.redirect('/user/change-password/' + req.params.userId);
  }

  User.findById(req.params.userId, (err, user) => {
    user.password = req.body.password;
    user.save((err) => {
      if (err) { 
        req.flash('success', 'Có lỗi xảy ra');
        return res.redirect('/user');
      }
      req.flash('success', 'Mật khẩu đã được thay đổi thành công');
      res.redirect('/user');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
  User.remove({ _id: req.user.id }, (err) => {
    if (err) { return next(err); }
    req.logout();
    req.flash('info', { msg: 'Your account has been deleted.' });
    res.redirect('/');
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = (req, res, next) => {
  const provider = req.params.provider;
  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user[provider] = undefined;
    user.tokens = user.tokens.filter(token => token.kind !== provider);
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('info', { msg: `${provider} account has been unlinked.` });
      res.redirect('/account');
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (err) { return next(err); }
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset'
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  const resetPassword = () =>
    User
      .findOne({ passwordResetToken: req.params.token })
      .where('passwordResetExpires').gt(Date.now())
      .then((user) => {
        if (!user) {
          req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
          return res.redirect('back');
        }
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        return user.save().then(() => new Promise((resolve, reject) => {
          req.logIn(user, (err) => {
            if (err) { return reject(err); }
            resolve(user);
          });
        }));
      });

  const sendResetPasswordEmail = (user) => {
    if (!user) { return; }
    const transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
      }
    });
    const mailOptions = {
      to: user.email,
      from: 'hackathon@starter.com',
      subject: 'Your Hackathon Starter password has been changed',
      text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
    };
    return transporter.sendMail(mailOptions)
      .then(() => {
        req.flash('success', { msg: 'Success! Your password has been changed.' });
      });
  };

  resetPassword()
    .then(sendResetPasswordEmail)
    .then(() => { if (!res.finished) res.redirect('/'); })
    .catch(err => next(err));
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  const createRandomToken = crypto
    .randomBytesAsync(16)
    .then(buf => buf.toString('hex'));

  const setRandomToken = token =>
    User
      .findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('errors', { msg: 'Account with that email address does not exist.' });
        } else {
          user.passwordResetToken = token;
          user.passwordResetExpires = Date.now() + 3600000; // 1 hour
          user = user.save();
        }
        return user;
      });

  const sendForgotPasswordEmail = (user) => {
    if (!user) { return; }
    const token = user.passwordResetToken;
    const transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
      }
    });
    const mailOptions = {
      to: user.email,
      from: 'hackathon@starter.com',
      subject: 'Reset your password on Hackathon Starter',
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${req.headers.host}/reset/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };
    return transporter.sendMail(mailOptions)
      .then(() => {
        req.flash('info', { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
      });
  };

  createRandomToken
    .then(setRandomToken)
    .then(sendForgotPasswordEmail)
    .then(() => res.redirect('/forgot'))
    .catch(next);
};


