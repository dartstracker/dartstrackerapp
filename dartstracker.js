const {MongoClient} = require('mongodb');
const http = require('http');

async function main() {

  const uri = 'mongodb+srv://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@dartstracker.j7gzq.mongodb.net/dartstracker?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  try {
      await client.connect();
      await listDatabases(client);

  } catch (e) {
      console.error(e);
  } finally {
    await client.close();
  }
}
main().catch(console.error);
async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
    var server = http.createServer(function(req, res) {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      });
        var databaseJson = JSON.stringify(databasesList.databases);
        res.end(databaseJson);
    });
    server.listen();
}
