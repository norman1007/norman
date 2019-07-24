$(document).ready(function() {
    var socket = io();

    const limitUserListName = (name, limit = 6) => {
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

    socket.on('connect', function() {

        var room = 'GlobalRoom';
        var name = $('#name-user').val();
        var img = $('#name-image').val();
        var emp_name = $('#empname-user').val();

        socket.emit('global room', {
            room: room,
            name: name,
            img: img,
            emp_name: emp_name
        });
    });

    socket.on('loggedInUser', function(currentUsers) {
  
        var name = $('#name-user').val();
        var image = $('#name-image').val();
        var ol = $('<div></div>');
        var arr = [];

        for(var i = 0; i < currentUsers.length; i++) {
            
            arr.push(currentUsers[i]);

            ol.append(`
            <a class="ui image label">
                <img src="/profile-saya/${currentUsers[i].img}/avatar">
                ${limitUserListName(currentUsers[i].emp_name)}
            </a>
            `)

            // ol.append(currentUsers[i].name);
        }

        $('#numOfUsers').text('(' + arr.length + ')');
        $('.onlineUsers').html(ol);

    });
});