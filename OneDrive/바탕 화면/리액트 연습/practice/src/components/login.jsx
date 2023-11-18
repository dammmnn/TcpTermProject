import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = { username, password };
    try {
      const response = await axios.post('http://localhost:5001/login', data);
      console.log(response.data);
      if (response.data.success) { // 서버에서 성공 응답을 반환하면 메인 페이지로 이동
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
    <div className="loginBox">
      <h1>로그인</h1>
      <form onSubmit={handleLogin}>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Login</button>
        <button onClick={handleSignUp}>Sign Up</button> {/* 회원가입 버튼 추가 */}
      </form>
    </div>
  );
}

export default Login;
