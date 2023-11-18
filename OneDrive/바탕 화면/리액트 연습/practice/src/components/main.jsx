import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const Home = () => {

  const [roomName, setRoomName] = useState('');
  const [rooms, setRooms] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state.username;

  const socket = io('http://localhost:5001'); //서버 주소

  useEffect(() => {
    axios.get('http://localhost:5001/rooms')
      .then(response => {
        setRooms(response.data.rooms);
      })
      .catch(error => {
        console.error(error);
      });

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('roomUsers', (users) => {
      setRoomUsers(users);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.off();
    };
  }, []);

  const handleCreateRoom = () => {
    if (roomName) {
      axios.post('http://localhost:5001/main', { roomName, username })
        .then(response => {
          console.log(response.data);
          setRoomName('');
          // 방 생성 후에 방 목록 다시 불러오기
          axios.get('http://localhost:5001/main')
            .then(response => {
              setRooms(response.data.rooms);
              // 방 생성 후 바로 방에 입장
              const createdRoomName = response.data.roomName; // 받은 응답에서 방 제목을 가져옵니다.
              handleJoinRoom(createdRoomName);
            })
            .catch(error => {
              console.error(error);
            });
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  const handleJoinRoom = (room) => {
    if (room && username) {
      socket.emit('joinRoom', { roomName: room, username });
      socket.on('joinRoomSuccess', () => {
        navigate(`/room/${room}`, { state: { username } }); // username을 포함한 state 객체를 전달
      });
      socket.on('joinRoomError', (error) => {
        console.error(error);
      });
    }
  };

  return (
    <div>
      <h1>대기방</h1>
      <div className='newroom'>
        <input className='newroom_text'
          type="text"
          placeholder="Enter room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button className="newroom__submit" onClick={handleCreateRoom}>방 만들기</button>
      </div>

      <h2>방 목록</h2>
      <button className="room-list__refresh" onClick={() => {
        axios.get('http://localhost:5001/main')
          .then(response => {
            console.log(response); // 응답 출력
            setRooms(response.data.rooms);
          })
          .catch(error => {
            console.error(error);
          });
      }}>방 목록 가져오기</button>
      <ul class="room-list">
        {rooms.map((room, index) => (
          <li key={index}>
            {room}
            <button class="join-button" onClick={() => handleJoinRoom(room)}>Join</button>
          </li>
        ))}
      </ul>
      <h2>Room Users</h2>
      <ul>
        {roomUsers.map((user, index) => (
          <li key={index}>{user}</li>
        ))}
      </ul>
    </div>
  );

};

export default Home;
