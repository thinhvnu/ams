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
      
        Apartment.findById(req.body.apartmentId, (err, apartment) => {
          User.findOne({ userName: req.body.userName }, (err, existingUser) => {
            if (err) { 
              return res.json({
                success: false,
                errorCode: '113',
                message: 'Save user failed'
              })
            }
            if (existingUser) {
              apartment.users.pull(existingUser._id);
              apartment.users.push(existingUser._id);
              apartment.save();

              if (existingUser.apartments) {
                existingUser.apartments.pull(apartment._id);
                existingUser.apartments.push(apartment._id);
              } else {
                existingUser.apartments = [];
                existingUser.apartments.push(apartment._id);
              }
              existingUser.save();

              return res.json({
                success: true,
                errorCode: 0,
                message: 'Successfully'
              })
            }

            user.apartments.pull(apartment._id);
            user.apartments.push(apartment._id);
            
            user.save(function (err, user) {
              if (err) { 
                console.log('error create new user', err);
                return next(err); 
              }

              console.log('apartment', apartment);
              if (apartment.user) {
                apartment.users.pull(user._id);
              }
              else {
                apartment.users = [];
                apartment.users.push(user._id);
              }
              
              apartment.save((err, a) => {
                console.log('err', err);
              });

              return res.json({
                success: true,
                errorCode: 0,
                message: 'Successfully'
              })
            }.bind(apartment));
          });
        });
      }
  });
};

exports.postAddExistUser = function (req, res) {
  Apartment.findById(req.body.apartmentId)
  .populate('building').exec( (err, apartment) => {
    let apartmentUser = JSON.parse(req.body.apartmentUser);

    for (let i=0; i<apartmentUser.length; i++) {
      if (!apartment.users) {
        apartment.users = [];
      }
      apartment.users.pull(apartmentUser[i]);
      apartment.users.push(apartmentUser[i]);

      User.findById(apartmentUser[i], (err, user) => {
        if (user) {
          user.apartment = apartment._id;
          user.building = apartment.building._id;
          user.buildingGroup = apartment.building.apartmentBuildingGroup;
          user.save();
        }
      })
    }
    apartment.save();
    
    return res.json({
      success: true,
      errorCode: 0,
      message: 'Successfully'
    })
  })
}