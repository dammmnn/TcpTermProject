import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from './axiosConfig';
import NavbarComponent from './navbar';
import { useSelector } from 'react-redux';


const Home = () => {
    const [roomName, setRoomName] = useState('');
    const [rooms, setRooms] = useState([]);
    const [roomUsers, setRoomUsers] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const username = useSelector(state => state.user);

    const socket = io('http://localhost:5001'); //서버 주소
    const messagesEndRef = useRef(null);

    useEffect(() => {
        axios.get('http://localhost:5001/main') // 방 목록 가져오는거
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
    }, []);  // 빈 배열을 추가했습니다.

    const handleLogout = async () => { // 로그아웃 함수 추가
        try {
            const response = await axios.post('http://localhost:5001/logout');
            if (response.data.success) {
                alert('로그아웃 되었습니다');
                navigate('/login');
            } else {
                alert('로그아웃에 실패했습니다');
            }
        } catch (error) {
            console.error(error);
        }
    };

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
            navigate(`/room/${room}`, { state: { username, room } }); 
        }
    };


    return (
        <div className='maincontainer'>
            <div>
                <NavbarComponent username={username} onLogout={handleLogout} />
            </div>
            <h1></h1>
            <div className='newroom-container'> {/* 여기에 새로운 클래스 이름을 추가했습니다. */}
                <div className='newroom'>
                    <input className='newroom_text'
                        type="text"
                        placeholder="Enter room name"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                    />
                    <button className="newroom__submit" onClick={handleCreateRoom}>방 만들기</button>
                </div>
            </div>
    
            <div className='roomlist-container'> {/* 여기에 새로운 클래스 이름을 추가했습니다. */}
                <h2>방 목록</h2>
                <ul class="room-list">
                    {rooms.map((room, index) => (
                        <li key={index}>
                            {room}
                            <button class="join-button" onClick={() => handleJoinRoom(room)}>Join</button>
                        </li>
                    ))}
                </ul>
            </div>
            <div ref={messagesEndRef} />
        </div>
    );
    
};

export default Home;
