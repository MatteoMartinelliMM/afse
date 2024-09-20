const {MongoClient, ServerApiVersion} = require('mongodb');
const uri = "mongodb+srv://tvoosai:ciao12345@afsecluster.qror5sm.mongodb.net/?retryWrites=true&w=majority&appName=afsecluster";

let db;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.DATABASE_PATH, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function getClientInstance() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        if (!db) {
            await client.connect()
            console.log('Db connected successfully.');
            db = client.db('afse')
        }
        return client;
    } catch (e) {
        console.error(e);
    }
}

async function getDbInstance() {
    if (!db) {
        throw new Error('Database connection not initialized.');
    }
    return db;
}


module.exports = {
    getDbInstance: getDbInstance,
    getClientInstance: getClientInstance,
}