const Apartment = require('../../models/Apartment');
const User = require('../../models/User');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

exports.postAddNewUser = function (req, res) {
    req.checkBody('firstName', 'firstName is required').notEmpty();
    req.checkBody('lastName', 'lastName is required').notEmpty();
    req.checkBody('userName', 'UserName is required').notEmpty();
    req.checkBody('email', 'Email is invalid').isEmail();
    req.checkBody('password', 'Password must be at least 4 characters long').len(4);
    req.checkBody('confirmPassword', 'Passwords do not match').equals(req.body.password);
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });
    
    req.getValidationResult().then(function(errors) {
        if (!errors.isEmpty()) {
          var errors = errors.mapped();
    
          return res.json({
            errors: errors,
            data: req.body
          });
        } else {
          const user = new User();
          user.firstName = req.body.firstName;
          user.lastName = req.body.lastName;
          user.userName = req.body.userName;
          user.email = req.body.email;
          user.password = req.body.password;

          user.status = 1;
        
          User.findOne({ email: req.body.userName }, (err, existingUser) => {
            if (err) { return next(err); }
            if (existingUser) {
              req.flash('errors', { msg: 'Account with that email address already exists.' });
              return res.redirect('/apartment/view/' + req.body.apartmentId);
            }
            user.save((err) => {
              if (err) { 
                console.log('error create new user', err);
                return next(err); 
              }
              return res.json({
                  success: true,
                  errorCode: 0,
                  message: 'Successfully'
              })
            });
          });
        }
    });
};