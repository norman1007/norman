const async = require('async');
const Discussions = require('../models/discussions');
const Kewpa3 = require('../models/kewpa3');
const User = require('../models/user');
const moment = require('moment');

module.exports = function(io, Users) {

    const users = new Users();

    io.on('connection', (socket) => {
        //console.log('user connected');

        socket.on('join', (params, callback) => {
            socket.join(params.room);

            users.AddUserData(socket.id, params.name, params.room, params.image);
            // console.log(users);
            io.to(params.room).emit('usersList', users.GetUsersList(params.room));

            callback();
        });

        socket.on('createMessage', (message, callback) => {
            // console.log(message);
            io.to(message.room).emit('newMessage', {
                text: message.text,
                room: message.room,
                from: message.sender,
                senderPhoto: message.senderPhoto,
                dateChat: moment(message.dateChat).fromNow()
            });
            
            callback();
        }); 

        socket.on('disconnect', () => {
            var user = users.RemoveUser(socket.id);

            if(user) {
                io.to(user.room).emit('usersList', users.GetUsersList(user.room));
            }
        })

    });


};