const connectedUsers = {};

module.exports = function(io, connection) {
    const rooms = [];

    io.on('connection', (socket) => {
        let currentRoom = null;

        socket.on('login', (nickname) => {
            connectedUsers[socket.id] = nickname;
            console.log(`${nickname} logged in.`);
        });

        socket.on('joinRoom', ({ roomName, username }) => { 
            currentRoom = roomName;
            socket.join(currentRoom);
        
            const query = 'SELECT * FROM rooms WHERE roomName = ?';
            connection.query(query, [roomName], function(err, results) {
                if (err) {
                    console.error(err);
                    socket.emit('joinRoomError', 'An error occurred while joining the room');
                } else {
                    if (results && results.length > 0) { // 결과가 존재하는지 확인
                        socket.emit('joinRoomSuccess');
                        io.to(roomName).emit('roomUsers', results[0].users);
                        const numUsers = io.sockets.adapter.rooms[currentRoom].length;
                        io.to(currentRoom).emit('참여자 수 업데이트', numUsers);
                    } else {
                        socket.emit('joinRoomError', 'Room does not exist');
                    }
                }
            });
        });

        socket.on('chat message', (msg) => { 
            io.emit('chat message', msg);
        });

        socket.on('leaveRoom', () => {
          socket.leave(currentRoom);
        });

        socket.on('disconnect', () => {
            const nickname = connectedUsers[socket.id];
            if (nickname) {
                delete connectedUsers[socket.id];
                console.log(`${nickname} logged out.`);
                if (currentRoom) {
                    const numUsers = io.sockets.adapter.rooms[currentRoom]?.length || 0;
                    io.to(currentRoom).emit('참여자 수 업데이트', numUsers);
                }
            }
        });
    });
};
