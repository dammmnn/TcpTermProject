const { createServer } = require("http");
const express = require("express");
const cors = require("cors");
const bcrypt = require('bcrypt');
const session = require('express-session'); 
const multer = require('multer');
const path = require('path');
const app = express();
var mysql = require('mysql');
const { Server } = require("socket.io");

// multer 설정 추가
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true  
}));
app.use(express.json());
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use('/uploads', express.static('uploads'));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
      origin: "http://localhost:3000",
      credentials: true 
  }
});
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

app.post('/signup', async function(req, res) {
    var user = req.body;
    user.password = await bcrypt.hash(user.password, 10);

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

app.post('/login', function(req, res) {
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
                    req.session.user = results[0]; 
                    res.json({ success: true });
                } else {
                    res.json({ success: false, message: 'Wrong password' });
                }
            } else {
                res.json({ success: false, message: 'User not found' });
            }
        }
    });
});

app.post('/logout', function(req, res) { 
    req.session.destroy(); 
    res.json({ success: true });
});

app.post('/main', function(req, res) {
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

app.get('/main', function(req, res) {
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

app.get('/mypage', function(req, res) {
    const { username } = req.query;
  
    var query = 'SELECT * FROM users WHERE username = ?';
    connection.query(query, [username], function(err, results) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'An error occurred while getting user information' });
        } else {  
            var user = results[0];
            delete user.password;
            user.birth = new Date(user.birth).toISOString().split('T')[0];
            res.json(user);
        }
    });
});

app.put('/mypage', function(req, res) {
    let { username, nickname, birth, phone } = req.body;
  
    birth = new Date(birth).toISOString().split('T')[0];
  
    var query = 'UPDATE users SET nickname = ?, birth = ?, phone = ? WHERE username = ?';
    connection.query(query, [nickname, birth, phone, username], function(err, result) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'An error occurred while updating user information' });
        } else {
            res.json({ success: true });
        }
    });
});

app.post('/upload', upload.single('photo'), function(req, res) {
    if (!req.file) {
        res.status(400).send('No file uploaded.');
        return;
    }

    const photoUrl = '/uploads/' + req.file.filename;
    const { username } = req.body;

    var query = 'UPDATE users SET photo = ? WHERE username = ?';
    connection.query(query, [photoUrl, username], function(err, result) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while updating user photo' });
      } else {
        res.json({ photoUrl, success: true });
      }
    });
});

require("./utils/io")(io, connection);

httpServer.listen(5001, () => {
    console.log("서버 동작 중...");
});
