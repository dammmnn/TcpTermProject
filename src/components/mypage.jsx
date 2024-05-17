import axios from './axiosConfig';
import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import MyPageNavbarComponent from './mypagenavbar';

const MyPage = () => {
  const [user, setUser] = useState({});
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [birth, setBirth] = useState('');
  const [phone, setPhone] = useState('');
  const fileInputRef = useRef(null);

  const username = useSelector(state => state.user);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/mypage?username=${username}`);
        setUser(response.data);
        setNickname(response.data.nickname);
        setBirth(response.data.birth);
        setPhone(response.data.phone);
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    };
    fetchUser();
  }, [username]);

  const handleProfilePhotoChange = async () => {
    if (fileInputRef.current.files.length === 0) {
      alert('파일을 선택해주세요.');
      return;
    }
  
    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('username', username);
  
    try {
      const response = await axios.post(`http://localhost:5001/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const updatedUser = { ...user, photoUrl: response.data.photoUrl };
      setUser(updatedUser);
      alert('프로필 사진이 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('Failed to upload profile photo', error);
      alert('프로필 사진을 업데이트하는데 실패하였습니다.');
    }
  };
  
  

  const handleInfoEdit = async () => {
    if (editing) {
      try {
        const updatedUser = { ...user, nickname, birth, phone };
        await axios.put(`http://localhost:5001/mypage?username=${username}`, updatedUser);
        setUser(updatedUser);
        alert('사용자 정보가 성공적으로 업데이트되었습니다.');
      } catch (error) {
        console.error('Failed to update user', error);
        alert('사용자 정보를 업데이트하는데 실패하였습니다.');
      }
    }
    setEditing(!editing);
  };

  const handleNicknameChange = (event) => {
    setNickname(event.target.value);
  };

  const handleBirthChange = (event) => {
    setBirth(event.target.value);
  };

  const handlePhoneChange = (event) => {
    setPhone(event.target.value);
  };

  return (
    <div>
      <MyPageNavbarComponent />
      <div className="mypage">
        <div className="mypage-header">
          <h2>My Page</h2>
          <button onClick={handleInfoEdit}>{editing ? '저장' : '편집'}</button>
        </div>
        <div className="profile">
          <div className="profile-info">
            <div className="profile-photo">
              {user.photoUrl 
                ? <img src={user.photoUrl} alt="User profile" /> 
                : <div className="empty-profile-photo"></div>
              }
              <button onClick={handleProfilePhotoChange}>사진 변경</button>
            </div>
            {editing ? <input type="text" value={nickname} onChange={handleNicknameChange} /> : <h1 className="nickname">{user.nickname}</h1>}
          </div>
          <div className="profile-row">
            <label>Name:</label>
            <span>{user.username}</span>
          </div>
          <div className="profile-row">
            <label>Birth:</label>
            {editing ? <input type="text" value={birth} onChange={handleBirthChange} /> : <span>{user.birth}</span>}
          </div>
          <div className="profile-row">
            <label>Phone:</label>
            {editing ? <input type="text" value={phone} onChange={handlePhoneChange} /> : <span>{user.phone}</span>}
          </div>
          <div className="profile-row">
            <label>Email:</label>
            <span>{user.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
