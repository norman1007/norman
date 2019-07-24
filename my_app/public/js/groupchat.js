$(document).ready(function () {
    var socket = io();

    var room = $('#groupId').val();
    var sender = $('#sender').val();
    var senderPhoto = $('#currentUserId').val();
    var dateChat = new Date();

    const limitUserListName = (name, limit = 14) => {
        const newName = [];
        if(name.length > limit) {
            name.split(' ').reduce((acc, cur) => {
                if(acc + cur.length <= limit) {
                    newName.push(cur)
                }
                return acc + cur.length;
            }, 0);

            return `${newName.join(' ')}...`;
        }
        return name;
    };

    socket.on('connect', function () {
        var params = {
            room: room,
            name: sender,
            image: senderPhoto,
            dateChat: dateChat
        }
        socket.emit('join', params, function () {
            //console.log('User has join this channel');
        });
    });

    socket.on('usersList', function (users) {
        // console.log(users);
        var ol = $('<div></div>');

        for (var i = 0; i < users.length; i++) {
            //ol.append(`<img class="ui avatar image" src="${users[i].image}" /><p>${users[i].name}</p>`);

            ol.append(`
            <a class="item">
                <div class="statistic">
                    <div class="value">
                        <img src="/profile-saya/${users[i].image}/avatar" class="mini ui rounded inline image"> <strong>${limitUserListName(users[i].name)}</strong>
                    </div>
                </div>
            </a>
            `)
        }

        $('#numVal').text('Senarai Pengguna (' + users.length + ')');
        $('#usersList').html(ol);
    });

    socket.on('newMessage', function (data) {
        // console.log('/js/groupchat' + data);
        var template = $('#message-template').html();
        var message = Mustache.render(template, {
            room: data.room,
            text: data.text,
            sender: `${limitUserListName(data.from)}`,
            senderPhoto: data.senderPhoto,
            dateChat: data.dateChat
        });

        $('#messages').append(message);
    });

    $('#message-form').on('submit', function (e) {
        e.preventDefault();

        var msg = $('#msg').val();

        socket.emit('createMessage', {
            text: msg,
            room: room,
            sender: sender,
            senderPhoto: senderPhoto,
            dateChat: dateChat
        }, function () {
            $('#msg').val('');
        });

        $.ajax({
            url: '/index/assets/' + room + '/discussions',
            type: 'POST',
            data: {
                message: msg,
                groupId: room,
                senderPhoto: senderPhoto,
                dateChat: dateChat
            },
            success: function () {
                $('#msg').val('');
            }
        })
    });
});