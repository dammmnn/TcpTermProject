import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';

const Room = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [roomUsers, setRoomUsers] = useState([]);
    const [nickname, setNickname] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    const username = location.state.username;
    const socket = useRef(null);
    const chatBoxRef = useRef(null); 

    useEffect(() => {
        axios.get(`http://localhost:5001/mypage?username=${username}`, { withCredentials: true })
            .then(response => {
                setNickname(response.data.nickname);
            })
            .catch(error => {
                console.error(error);
            });

        socket.current = io('http://localhost:5001');
    
        socket.current.emit('joinRoom', { username: nickname || username, roomName: location.state.room });
        
        socket.current.on('roomUsers', setRoomUsers);
        
        return () => {
            socket.current.emit('leaveRoom', { username: nickname || username, room: location.state.room });
            socket.current.disconnect();
        };
    }, []); 
    
    const handleSend = () => {
        if (inputText) {
            const sender = nickname || username;
            socket.current.emit('chat message', { username: sender, message: inputText });
            setInputText('');
        }
    };

    const handleLeave = () => {
        const leaveMessage = `${nickname || username}님이 방을 나갔습니다.`;
        socket.current.emit('chat message', { username: '시스템', message: leaveMessage });
        socket.current.emit('leaveRoom', { username: nickname || username, room: location.state.room });
        navigate('/main', { state: { username }});
    };

    useEffect(() => {
        const handleSystemMessage = (msg) => {
            setMessages(oldMessages => [...oldMessages, msg]);
        };

        const handleChatMessage = (msg) => {
            setMessages(oldMessages => [...oldMessages, msg]);
        };

        socket.current.on('system message', handleSystemMessage);
        socket.current.on('chat message', handleChatMessage);

        return () => {
            socket.current.off('system message', handleSystemMessage);
            socket.current.off('chat message', handleChatMessage);
        };
    }, []);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="ChatApp">
            <div className="Container">
                <div className="UserListContainer"> 
                    <h3>접속중인 사용자</h3>
                    <div className="UserList">
                        {roomUsers.map((user, index) => (
                            <div className="User" key={index}>{user}</div>
                        ))}
                    </div>
                </div>
                <div className="Divider"/>
                <div className="ChatContainer">
                    <div className="ChatBox" ref={chatBoxRef}>
                    {messages.map((msg, idx) => {
    const { username: msgUser, message } = msg;
    const isMine = msgUser === (nickname || username);
    return (
        <div 
            className={`Message ${isMine ? 'MyMessage' : 'OtherMessage'}`} 
            key={idx}
        >
            {`${msgUser}: ${message}`}
        </div>
    );
})}
                    </div>
                    <div className="InputBox">
                        <input
                            className="TextInput"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            placeholder="내용"
                        />
                        <button className="SendButton" onClick={handleSend}>등록</button>
                    </div>
                    <button onClick={handleLeave}>방 나가기</button>
                </div>
            </div>
        </div>
    );
};

export default Room;
