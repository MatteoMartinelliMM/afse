const {MongoClient, ServerApiVersion} = require('mongodb');
const uri = "mongodb+srv://tvoosai:ciao12345@afsecluster.qror5sm.mongodb.net/?retryWrites=true&w=majority&appName=afsecluster";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.DATABASE_PATH, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectClient() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect()
        console.log('Db connected successfully.');
        return client;
    } catch (e) {
        console.log('entro qua')
        console.error(e);
    }
}

async function getDbInstance() {
    let c = await connectClient();
    return c.db('afse')
}


module.exports = {
    getDbInstance: getDbInstance,
}