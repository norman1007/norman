class Global {
    constructor() {
        this.globalRoom = [];
    }

    EnterRoom(id, name, room, img, emp_name) {
        var roomName = { id, name, room, img, emp_name };
        this.globalRoom.push(roomName);
        return roomName;
    }

    RemoveUser(id) {
        var user = this.GetUser(id);
        if(user) {
            this.users = this.globalRoom.filter((user) => user.id !== id);
        }
        return user;
    }

    GetUser(id) {
        var getUser = this.globalRoom.filter((userId) => {
            return userId.id === id;
        })[0];
        return getUser;
    }

    GetRoomList(room) {
        var roomName = this.globalRoom.filter((user) => user.room === room);

        var namesArray = roomName.map((user) => {
            return {
                name: user.name,
                img: user.img,
                emp_name: user.emp_name
            }
        });

        return namesArray;
    }
}

module.exports = {Global};