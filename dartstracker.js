//TODO: Figure out socket.io

// dotenv pulls in environment variables from .env file
require('dotenv').config();

// setting up mongodb
const {MongoClient} = require('mongodb');
const port = process.env.PORT || 8000;
const uri = 'mongodb+srv://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@dartstracker.j7gzq.mongodb.net/dartstracker?retryWrites=true&w=majority';
const client = new MongoClient(uri);

// setting up express
const express = require('express');
const app = express();

// start express server
app.listen(port, function() {
  console.log('listening on ' + port);
});

// root server handling
app.get('/', (req, res) => {
  if(originDefined(req, res)){
    setGetHeaders(res);
    main(res);
  }
});

// save game handling
app.post('/saveGame', function (req, res) {
  if(originDefined(req, res)){
    setPostHeaders(res);
    saveGame(req, res);
  }
})

// function to check if the origin is defined in the request headers, redirects if origin isn't set
function originDefined(req, res){
  reqOrigin = req.get('origin');
  if(typeof reqOrigin == 'undefined'){
    res.redirect('https://dartstracker.github.io');
    return false;
  } else {
    return true;
  }
}

// setting headers for a GET request
function setGetHeaders(res){
  res.set({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Allow-Methods': 'GET'
  });
}

// setting headers for a POST request
function setPostHeaders(res){
  res.set({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Allow-Methods': 'POST'
  });
}

// function that is called from root
async function main(res) {
  try {
      await client.connect();
      await getGamesCount(client, res);
  } catch (e) {
      console.error(e);
      res.send(e);
  } finally {
    await client.close();
  }
}

// function to return all the saved games in db
async function getGamesCount(client, res){
  gamesArray = [];
  cursor = client.db('dartstracker').collection('games').find();
  await cursor.forEach(function(item){
    gamesArray.push(item);
  });
  res.send(JSON.stringify(gamesArray));
}
