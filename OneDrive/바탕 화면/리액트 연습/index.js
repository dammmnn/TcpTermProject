const {createServer} =require("http")
const express = require("express");
const cors =require("cors");
const bcrypt = require('bcrypt');
const app = express();
var mysql = require('mysql');
app.use(cors());
app.use(express.json());
const {Server} = require("socket.io")

const httpServer =createServer(app);
const io = new Server(httpServer,{
cors:{
origin:"http://localhost:3000"

}
})

var connection = mysql.createConnection({
host: 'localhost',
user: 'root',
password: '1234',
database: 'chat'
});

connection.connect(function(err) {
if (err) throw err;
console.log('Connected to the database');
});

app.post('/signup', async function(req, res) { // 회원가입 데이터베이스
var user = req.body;
user.password = await bcrypt.hash(user.password, 10); // 패스워드 저장 전 해쉬값으로 변환

var query = 'INSERT INTO users SET ?';
connection.query(query, user, function (err, result) {
  if (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while creating the user' });
  } else {
    console.log('User created successfully');
    res.json({ id: result.insertId });
  }
});
});

app.post('/login', function(req, res) { // 로그인 데이터베이스
var user = req.body;

var query = 'SELECT * FROM users WHERE username = ?';
connection.query(query, [user.username], async function (err, results) {
  if (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while logging in' });
  } else {
    if(results.length > 0) {
      const comparison = await bcrypt.compare(user.password, results[0].password)
      if(comparison){
          console.log('User logged in successfully');
          res.json({ success: true });
      }else{
          res.json({ success: false, message: 'Wrong password' });
      }
    }else{
      res.json({ success: false, message: 'User not found' });
    }
  }
});
});

app.post('/main', function(req, res) { // 방 생성
var room = req.body;

var query = 'INSERT INTO rooms SET ?';
connection.query(query, room, function(err, result) {
  if (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while creating the room' });
  } else {
    console.log('Room created successfully');
    res.json({ id: result.insertId });
  }   
});
});

app.get('/main', function(req, res) { // 방 목록 가져오기
var query = 'SELECT * FROM rooms';
connection.query(query, function(err, results) {
if (err) {
console.error(err);
res.status(500).json({ error: 'An error occurred while getting the rooms' });
} else {
res.json({ rooms: results.map(result => result.roomName) });
}
});
});

require("./utils/io")(io, connection);
httpServer.listen(5001, ()=>{
console.log("서버 동작 중...");
});