import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from './redux'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = { username, password };
    try {
      const response = await axios.post('http://localhost:5001/login', data);
      console.log(response.data);
      if (response.data.success) { 
        dispatch(setUser(username)); // 로그인 성공 시 setUser 액션 디스패치
        navigate('/main', { state: { username }});
      } else {
        alert('회원아이디 또는 비밀번호가 일치하지 않습니다');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <>
      <div className="sidenav">
        <div className="login-main-text">
          <h2>수현이와 현담이의 채팅앱<br />로그인 페이지</h2>
          <p>여기에서 로그인하거나 등록하세요.</p>
        </div>
      </div>
      <div className="main">
        <div className="col-md-6 col-sm-12">
          <div className="login-form">
          <form onSubmit={handleLogin}>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} 
              placeholder="Username" 
              required />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password" 
              required />
              <div className="buttonWrapper">
                <button type="submit">로그인</button>
                <button onClick={handleSignUp}>회원가입</button> {/* 회원가입 버튼 추가 */}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;