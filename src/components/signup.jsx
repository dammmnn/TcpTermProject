import React, { useState } from 'react';
import axios from 'axios';

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submit button clicked');
    const data = { username, password, email};
    try {
      const response = await axios.post('http://localhost:5001/signup', data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div>
        <h1 className="my-4 font-weight-bold display-4">Sign up</h1>
        <form onSubmit={handleSubmit}>
          <fieldset
            className="border p-3"
            style={{
              width: 'fit-content',
              borderColor: 'lightgrey',
              borderRadius: '20px',
            }}
          >
            <legend className="w-auto"></legend>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <p></p>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                style={{
                  width: '400px',
                  height: '30px',
                  fontSize: '20px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <p></p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                style={{
                  width: '400px',
                  height: '30px',
                  fontSize: '20px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <p></p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                style={{
                  width: '400px',
                  height: '30px',
                  fontSize: '20px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                }}
              />
            </div>
            <button
            type="submit"
            className="btn btn-dark mt-3"
            style={{
              width: '150px',
              height: '50px',
              fontSize: '18px',
              color: 'white',
              backgroundColor: 'black',
              }}
              >
              가입하기
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}

export default Signup;