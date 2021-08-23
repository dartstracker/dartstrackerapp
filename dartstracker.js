// dotenv pulls in environment variables from .env file
require('dotenv').config();

// setting up mongodb
const {MongoClient} = require('mongodb');
const ObjectID = require('mongodb').ObjectId;
const port = process.env.PORT || 8000;
const uri = 'mongodb+srv://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@dartstracker.j7gzq.mongodb.net/dartstracker?retryWrites=true&w=majority';
const client = new MongoClient(uri);

// setting up express
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin:"*",
    methods: ["GET", "POST"]
  }
});

// root server handling
app.get('/', (req, res) => {
  res.redirect('https://dartstracker.github.io');
})


io.on('connection', (socket) => {
  socket.on('new game', (gameType) => {
    newGame(socket, gameType);
  });
  socket.on('join game', (gameId) => {
    joinGame(socket, gameId)
  });
  socket.on('save game', (gameObject) => {
    saveGame(socket, gameObject)
  });
});
io.of("/").adapter.on("join-room", (room, id) => {
  if(room != id){
    var thisSocket = io.sockets.sockets.get(id);
    thisSocket.broadcast.to(room).emit('player joined', id);
    console.log(`socket ${id} has joined room ${room}`);
  }
});

io.of("/").adapter.on("leave-room", (room, id) => {
  if(room != id){
    var thisSocket = io.sockets.sockets.get(id);
    thisSocket.broadcast.to(room).emit('player left', id);
    console.log(`socket ${id} has left room ${room}`);
  }
});

http.listen(port, function() {
   console.log('listening on *:' + port);
});
// function to create new game
async function newGame(socket, gameType){
  try {
    gameShell = {
      gameType: gameType
    }
    await client.connect();
    theDB = client.db('dartstracker');
    theDB.collection('games').insertOne(gameShell, function(err, res) {
      if (err) {
        io.to(socket.id).emit('error', err);
      } else {
        io.to(socket.id).emit('game created', res);
      }
      client.close();
    });
  } catch (e) {
      console.error(e);
      io.to(socket.id).emit('error', e);
      client.close();
  }
}

// function to join a game
async function joinGame(socket, gameId){
  try {
    gameShell = {
      _id: new ObjectID(gameId)
    }
    await client.connect();
    theDB = client.db('dartstracker');
    theDB.collection('games').findOne(gameShell, function(err, res) {
      if (err) {
        io.to(socket.id).emit('error', err);
      } else {
        io.to(socket.id).emit('game joined', res);
        socket.join(gameId);
      }
      client.close();
    });
  } catch (e) {
      console.error(e);
      io.to(socket.id).emit('error', e);
      client.close();
  }
}
// function to save a game
async function saveGame(socket, gameObject){
  try {
    await client.connect();
    theDB = client.db('dartstracker');
    let query = { _id: new ObjectID(gameObject._id)};
    let replacement = {
      gameType: gameObject.gameType,
      players: gameObject.players,
      states: gameObject.states
    }
    theDB.collection('games').replaceOne(query, replacement, function(err, res) {
      if (err) {
        io.to(socket.id).emit('error', err);
      } else {
        io.to(socket.id).emit('update successful', err);
        socket.broadcast.to(gameObject._id).emit('game updated', gameObject);
      }
      client.close();
    });
  } catch (e) {
      console.error(e);
      io.to(socket.id).emit('error', e);
      client.close();
  }
}
