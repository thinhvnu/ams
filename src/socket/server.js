const User = require('./../models/User');
const ChatGroup = require('./../models/ChatGroup');
const ChatRecent = require('./../models/ChatRecent');
const Notification = require('./../models/Notification');
const Message = require('./../models/Message');
const Post = require('./../models/Post');

const passport = require('./../middleware/passport');

var count = 0;

var ioEvents = function(io) {
    io.on('connection', function(socket){
        // console.log('client connected');
        /**
         * Event only for admin identify: if user loged in allow chat else show popup login
         * if user loged in => exist socket.request.user
         */
        var token = socket.handshake.query.token;
        if (token) {
            passport.jwtVerifyToken(token, user => {
                console.log('tttabc');
                if (user && user.id) {
                    /**
                     * Change socket id was generated by server to user Id
                     */
                    let uRooms = user.groups;
                    /**
                     * Join this room: using case 1 account login in many device
                     */
                    socket.join(user.id);
                    /**
                     * Join customer care room in order to reply customer's messages
                     */
                    for(let i=0; i<uRooms.length; i++) {
                        socket.join(uRooms[i].id);
                    }
                    /**
                     * Notification join chat success
                     */
                    let dataIdentification = {
                        id: user.id,
                        room: user.id,
                        avatar: user.avatar,
                        avatarUrl: user.avatarUrl,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        userName: user.userName,
                        phoneNumber: user.phoneNumber,
                        email: user.email
                    };
                    setTimeout(function(){
                        socket.emit('join_chat_successfully', dataIdentification);
                    }, 1500);
                    socket.identification = dataIdentification;
    
                    /**
                     * Update online status
                     */
                    user.isOnline = 1;
                    user.save();
                } else {
                    console.log('client auth failed and server auto disconnected');
                    socket.emit('authenticate_failed');
                    socket.disconnect(true);
                }
            })
        } else {
            var user = socket.handshake.session ? socket.handshake.session.user : null;
            if (user && user.id) {
                /**
                 * Change socket id was generated by server to user Id
                 */
                let uRooms = user.groups;
                /**
                 * Join this room: using case 1 account login in many device
                 */
                socket.join(user.id);
                /**
                 * Join customer care room in order to reply customer's messages
                 */
                for(let i=0; i<uRooms.length; i++) {
                    socket.join(uRooms[i].id);
                }
                /**
                 * Notification join chat success
                 */
                let dataIdentification = {
                    id: user.id,
                    room: user.id,
                    avatar: user.avatar,
                    avatarUrl: user.avatarUrl,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    userName: user.userName,
                    phoneNumber: user.phoneNumber,
                    email: user.email
                };
                socket.emit('join_chat_successfully', dataIdentification);
                socket.identification = dataIdentification;

                /**
                 * Update online status
                 */
                User.updateOne({_id: user.id}, {isOnline: 1}, (err, r) => {
                    if (err) {
                        console.log('update online failed');
                    } else {
                        console.log('update online status successfully');
                    }
                });
                // user.isOnline = 1;
                // user.save();
            }
        }
        /**
         * Event send message
         */
        socket.on('send_message', (data) => {
            let roomId = data.to.room || data.to._id || data.to.id;
            let senderId = data.sender.room || data.sender._id || data.sender.id;
            /**
             * Send message to recipient
             */
            io.to(roomId).emit('message', data);

            /**
             * Save message to database
             */
            let newMessage = new Message();
            newMessage.sender = senderId;
            newMessage.recipient = roomId;
            newMessage.messageContent = data.messageContent;
            newMessage.status = 1;

            newMessage.save((err, newMessage) => {});
            /**
             * Send message to sender in order to confirm message send successfully
             */
            io.to(senderId).emit('owner_message', data);

            /**
             * Save recent chat
             */
            ChatGroup.findById(roomId).exec((err, group) => {
                if (group) {
                    ChatRecent.findOne({
                        $or: [
                            {
                                sender: senderId,
                                group: roomId
                            }
                        ]
                    }).exec((err, c) => {
                        if (c) {
                            c.count = c.count + 1;
                            c.save();
                        } else {
                            let chatRecent = new ChatRecent();
                            chatRecent.sender = senderId;
                            chatRecent.group = group._id;
                            chatRecent.save();
                        }
                    })
                } else {
                    ChatRecent.findOne({
                        $or: [
                            {
                                sender: senderId,
                                partner: roomId
                            },
                            {
                                sender: roomId,
                                partner: senderId
                            }
                        ]
                    }).exec((err, c) => {
                        if (c) {
                            c.count = c.count + 1;
                            c.save();
                        } else {
                            let chatRecent = new ChatRecent();
                            chatRecent.sender = senderId;
                            chatRecent.partner = roomId;
                            chatRecent.save();
                        }
                    })
                }

            })
        })

        /**
         * Emit new comment
         */
        socket.on('new_comment', postId => {
            Post.findById(postId, {
                '_id': 1,
                'title': 1,
                'alias': 1,
                'image': 1,
                'imageUrl': 1,
                'description': 1,
                'content': 1,
                'category': 1,
                'comments': 1,
                'tags': 1,
                'seo': 1,
                'createdAt': 1
            })
            .populate({
                path: 'createdBy',
                model: 'User',
                select: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    avatar: 1,
                    avatarUrl: 1
                }
            })
            .populate({
                path: 'comments',
                model: 'Comment',
                populate: {
                    path: 'createdBy',
                    model: 'User',
                    select: { '_id': 0, 'userName': 1, 'firstName': 1, 'lastName': 1, 'avatar': 1, 'avatarUrl': 1 }
                }
            })
            .exec(function (err, post) {
                // if (err) {
                //     // console.log('err', err)
                //     // return done(err);
                // }
                io.sockets.emit('comment', post.comments);
            });
        })

        /**
         * Event create new service request
         */
        socket.on('new_service_request', data => {
            console.log('data', data);
            if (data) {
                Notification.find({objId: data._id}).exec((err, notifications) => {
                    for(let i=0; i<notifications.length; i++) {
                        io.to(notifications[i].recipient).emit('noti_new_service_request', notifications[i]);
                    }
                });
            }
        })

        /**
         * Event client disconnect
         */
        socket.on('disconnect', () => {
            console.log('reason', socket.identification);
            let identification = socket.identification;

            if (identification && identification.id) {
                try {
                    User.findById({_id: identification.id}, (err, user) => {
                        if (user) {
                            user.isOnline = 0;
                            user.save();
                        }
                    })
                } catch (e) {

                }
            }
        });
    });
}

module.exports = ioEvents;