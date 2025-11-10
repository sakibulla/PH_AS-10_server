const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express()
const port = 3000
const cors= require('cors')


const uri = "mongodb+srv://sakibulla:evMVxfgo7XqOrz9h@artify.evnytb4.mongodb.net/?appName=Artify";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.use(cors({
    origin:['http://localhost:5173/']
}))
app.use(express.json())
app.get('/',(req,res)=> {
    res.send("Server is running")
})

app.get('/hello',(req,res)=>{
    res.send("How are you")
}
)

app.listen(port, () => {
  console.log(`Server  is listening to the port ${port}`)
})
