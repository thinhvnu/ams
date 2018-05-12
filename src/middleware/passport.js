const jwt = require('jsonwebtoken');
const User = require('./../models/User');

const publicUrl = '/user/login';
/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
    let accessRouter = req.originalUrl;

    if (req.session.user) {
        User.findById(req.session.user._id).exec((err, u) => {
            if (u) {
                // console.log('u', u);
                req.session.user = u;
                if (this.hasPermission(req.session.user, accessRouter)) {
                    res.locals.user = req.session.user;
                    next();
                } else {
                    if (accessRouter === '/') {
                        next();
                    } else {
                        req.flash('errors', 'Bạn không có quyền thực hiện chức năng này. Liên hệ quản trị viên để được thêm chức năng');
                        return res.redirect('/');
                    }
                }
            }
        });
    } else {
        // check header or url parameters or post parameters for token
        var token = req.query.token || req.headers['x-access-token'] || req.headers['Authorization'] || req.headers['authorization'] || req.cookies[process.env.TOKEN_KEY];
    
        /**
         * Remove bearer or basic
         */
        if (token){
            token = token.split(' ');
            token = token[token.length - 1];
        }

        /** Verify token => userId */
        this.jwtVerifyToken(token, user => {
            if (user) {
                if (this.hasPermission(user, accessRouter)) {
                    req.session.user = user;
                    res.locals.user = user;
                    next();
                } else {
                    if (accessRouter === '/') {
                        next();
                    } else {
                        req.flash('errors', 'Bạn không có quyền thực hiện chức năng này. Liên hệ quản trị viên để được thêm chức năng');
                        return res.redirect('/');
                    }
                }
            } else {
                req.session.redirectTo = accessRouter;
                return res.redirect(publicUrl);
            }
        });
    }
};

exports.jwtCreateToken = (data) => {
    let token = jwt.sign(data, process.env.JWT_SECRET);

    return token;
}

exports.jwtVerifyToken = (token, cb) => {
    // verifies secret and checks exp
    jwt.verify(token, process.env.JWT_SECRET, function(err, data) {  
        if (err) {
          return cb(null);   
        } else {
          // if everything is good, save to request for use in other routes
            User.findOne({
                _id: data.userId,
                status: 1
            })
            .populate({
                path: 'groups',
                model: 'ChatGroup'
            })
            .exec((err, user) => {
                if (err) {
                    return cb(null);   
                } else {
                    return cb(user); 
                }
            });
        }
    });
}

/**
 * Check permission
 */
exports.hasPermission = (user, accessRouter) => {
    return true;
    if (user && user.roles instanceof Array) {
        for (let i=0; i<user.roles.length; i++) {
            let permissions = user.roles[i].permissions;
            
            if (permissions instanceof Array) {
                for (let j=0; j<permissions.length; j++) {
                    if (permissions[j].accessRouter === accessRouter) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

