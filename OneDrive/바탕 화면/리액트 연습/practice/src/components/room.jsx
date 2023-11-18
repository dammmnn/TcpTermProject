import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useLocation } from 'react-router-dom';

const socket = io('http://localhost:5001');

const Room = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [numUsers, setNumUsers] = useState(0); // 참여자 수를 저장할 state 추가
  const location = useLocation();
  const username = location.state.username;

  const handleSend = () => {
    if (inputText) {
      socket.emit('chat message', { username, message: inputText });
      setInputText('');
    }
  };

  useEffect(() => {
    socket.emit('chat message', { username: '시스템', message: `${username}님이 입장하셨습니다.` });
  
    socket.on('chat message', msg => {
      setMessages(oldMessages => [...oldMessages, `${msg.username}: ${msg.message}`]);
    });

    // '참여자 수 업데이트' 이벤트를 받아 state를 업데이트합니다.
    socket.on('참여자 수 업데이트', (num) => {
      setNumUsers(num);
    });

    return () => {
      socket.off(); 
    };
  }, []);

  return (
    <div className="ChatApp">
      <div className="Box">
        <div className="ChatBox">
          {messages.map((msg, idx) => (
            <div className="Message" key={idx}>{msg}</div>
          ))}
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
        <div>현재 참여자 수: {numUsers}</div> {/* 참여자 수를 화면에 출력 */}
      </div>
    </div>
  );
};

export default Room;
