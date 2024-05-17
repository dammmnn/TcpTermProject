const connectedUsers = {};

module.exports = function(io, connection) {
    io.on('connection', (socket) => {
        socket.on('joinRoom', ({ roomName, username }) => {
            // 데이터베이스에서 사용자의 닉네임 가져오기
            const query = 'SELECT * FROM users WHERE username = ?';
            connection.query(query, [username], function(err, results) {
                if (err) {
                    console.error(err);
                    socket.emit('joinRoomError', 'An error occurred while joining the room');
                } else {
                    if (results && results.length > 0) {
                        const user = results[0];
                        connectedUsers[socket.id] = user.nickname || username;
                    } else {
                        socket.emit('joinRoomError', 'User does not exist');
                        return;
                    }
        
                    socket.join(roomName);
                    socket.currentRoom = roomName;
        
                    const usersInRoom = Array.from(io.sockets.adapter.rooms.get(roomName) || []).map(id => connectedUsers[id]);
                    io.to(roomName).emit('roomUsers', usersInRoom);
                
                    const query = 'SELECT * FROM rooms WHERE roomName = ?';
                    connection.query(query, [roomName], function(err, results) {
                        if (err) {
                            console.error(err);
                            socket.emit('joinRoomError', 'An error occurred while joining the room');
                        } else {
                            if (results && results.length > 0) {
                                socket.emit('joinRoomSuccess');
                            } else {
                                socket.emit('joinRoomError', 'Room does not exist');
                            }
                        }
                    });
                }
            });
        });
        

        socket.on('leaveRoom', ({ username, room }) => {
            if (io.sockets.adapter.rooms.has(room)) {
                socket.leave(room);

                const usersInRoom = Array.from(io.sockets.adapter.rooms.get(room) || []).map(id => connectedUsers[id]);
                io.to(room).emit('roomUsers', usersInRoom);
        
                const numUsers = io.sockets.adapter.rooms.get(room)?.size || 0;
                io.to(room).emit('참여자 수 업데이트', numUsers);
        
                if (numUsers === 0) {
                    var query = 'DELETE FROM rooms WHERE roomName = ?';
                    connection.query(query, [room], function(err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log('Room deleted successfully');
                        }
                    });
                }
            }
        });

        socket.on('chat message', (msg) => { 
            io.to(socket.currentRoom).emit('chat message', msg);
        });

        socket.on('disconnect', () => {
            delete connectedUsers[socket.id];
        });
    });
};
