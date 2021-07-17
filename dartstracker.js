const {MongoClient} = require('mongodb');
const http = require('http');

async function main() {
  /**
   * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
   * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
   */
  const uri = "mongodb+srv://" + process.env.DB_USERNAME + ":" + process.env.DB_PASSWORD + "@dartstracker.j7gzq.mongodb.net/dartstracker?retryWrites=true&w=majority";
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
        res.writeHead(200, {'Content-Type': 'text/plain'});
        var response = databasesList.databases.db.name.join('\n');
        res.end(response);
    });
    server.listen();
}
