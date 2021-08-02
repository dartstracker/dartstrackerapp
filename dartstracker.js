const {MongoClient} = require('mongodb');
require('dotenv').config();
const express = require('express');
const app = express();
const port = 5000;

const uri = 'mongodb+srv://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@dartstracker.j7gzq.mongodb.net/dartstracker?retryWrites=true&w=majority';
const client = new MongoClient(uri);

app.listen(port, function() {
  console.log('listening on ' + port);
})
app.get('/', (req, res) => {
  res.set({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Allow-Methods': 'GET'
  });
  main(res);
})

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
async function getGamesCount(client, res){
  gamesArray = [];
  cursor = client.db('dartstracker').collection('games').find();
  await cursor.forEach( function(item){
    gamesArray.push(item);
  });
  res.send(JSON.stringify(gamesArray));
}
