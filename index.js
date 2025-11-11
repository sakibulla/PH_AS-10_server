const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

const uri = "mongodb+srv://sakibulla:evMVxfgo7XqOrz9h@artify.evnytb4.mongodb.net/?appName=Artify";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());

async function run() {
    try {
        await client.connect();
        const db = client.db('artify-db');
        const modelCollection = db.collection('Artify');

        // Get all artworks
        app.get('/Artify', async (req, res) => {
            const result = await modelCollection.find().toArray();
            res.send(result);
        });

        // Add new artwork
        app.post('/Artify', async (req, res) => {
            const data = req.body;
            console.log('Received:', data);
            const result = await modelCollection.insertOne(data);
            res.json(result);
        });

        app.get("/MyModels",async(req,res)=>{
            const email=req.query.email
            const result = await modelCollection.find({userEmail:email}).toArray()
            res.send(result)
        })

        

        // Get single artwork
        app.get('/Artify/:id', async (req, res) => {
    const { id } = req.params;

    const result = await modelCollection.findOne({ _id: id }); // just use string

    if (!result) {
        return res.status(404).send({ success: false, message: "Artwork not found" });
    }

    res.send({ success: true, result });
});


        

       // PATCH Like Route
app.patch('/Artify/:id/like', async (req, res) => {
    try {
        const { id } = req.params;

        // Use string _id, not ObjectId
        const updateDoc = { $inc: { likes: 1 } };
        const result = await modelCollection.updateOne({ _id: id }, updateDoc);

        if (result.modifiedCount > 0) {
            res.send({ success: true, message: "Like count updated successfully" });
        } else {
            res.status(404).send({ success: false, message: "Artwork not found" });
        }
    } catch (error) {
        console.error("Error updating likes:", error);
        res.status(500).send({ success: false, message: "Internal server error" });
    }
});


        await client.db("admin").command({ ping: 1 });
        console.log("✅ Connected to MongoDB!");
    } finally {
        // Keep connection open
    }
}
run().catch(console.dir);

// Test routes
app.get('/', (req, res) => res.send("Server is running"));
app.get('/hello', (req, res) => res.send("How are you"));

app.listen(port, () => {
    console.log(`🚀 Server is listening on port ${port}`);
});
