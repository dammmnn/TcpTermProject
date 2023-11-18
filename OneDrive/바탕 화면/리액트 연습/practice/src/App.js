import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Main from './components/main';
import Login from './components/login';
import SignUp from './components/signup'; 
import Room from './components/room';

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/' exact element={<Login />} />
        <Route path='/login' exact element={<Login />} />
        <Route path="/room/:roomName" element={<Room />} />
        <Route path='/main' element={<Main />} />
        <Route path='/signup' element={<SignUp />} />
      </Routes>
    </BrowserRouter>
    <div>      
    </div>
    </>
  );
}
 
export default App;
