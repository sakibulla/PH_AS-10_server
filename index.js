const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require("dotenv").config()
const app = express();
const port = 3000;
console.log(process.env.DB_USERNAME)


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@artify.evnytb4.mongodb.net/?appName=Artify`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.use(cors({ origin: '*' }));
app.use(express.json());

async function run() {
    try {
        const db = client.db('artify-db');
        const modelCollection = db.collection('Artify');
        const favoriteCollection = db.collection('favorites');

        const formatDoc = (doc) => ({ ...doc, _id: doc._id.toString() });

        app.get('/Artify', async (req, res) => {
            const result = await modelCollection.find().toArray();
            res.json(result.map(formatDoc));
        });


        app.get('/Artify/:id', async (req, res) => {
            const { id } = req.params;
            const result = await modelCollection.findOne({ _id: new ObjectId(id) });
            if (!result) return res.status(404).json({ success: false, message: "Artwork not found" });
            res.json({ success: true, result: formatDoc(result) });
        });

        app.get('/home-arts', async (req, res) => {
            try {
                const arts = await modelCollection
                    .find({})
                    .sort({ _id: -1 })
                    .limit(6)
                    .toArray();

                res.json(arts.map(formatDoc));
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        });


        app.get('/top-artists', async (req, res) => {
            try {
                const artists = await client.db('Artify')
                    .collection('users')
                    .find({})
                    .sort({ followers: -1 })
                    .limit(5)
                    .toArray();
                res.json(artists);
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        });

        app.post('/Artify', async (req, res) => {
            const data = req.body;
            const result = await modelCollection.insertOne(data);
            res.json({ ...data, _id: result.insertedId.toString() });
        });

        app.put('/Artify/:id', async (req, res) => {
            const { id } = req.params;
            const updatedModel = req.body;
            const result = await modelCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedModel }
            );
            res.json(result);
        });

        app.delete('/Artify/:id', async (req, res) => {
            const { id } = req.params;
            const result = await modelCollection.deleteOne({ _id: new ObjectId(id) });
            res.json(result);
        });

        app.patch('/Artify/:id/like', async (req, res) => {
            const { id } = req.params;
            const result = await modelCollection.updateOne(
                { _id: new ObjectId(id) },
                { $inc: { likes: 1 } }
            );
            if (result.modifiedCount > 0) {
                res.json({ success: true, message: "Like count updated" });
            } else {
                res.status(404).json({ success: false, message: "Artwork not found" });
            }
        });

        app.get('/MyModels', async (req, res) => {
            const email = req.query.email;
            if (!email) return res.json([]);
            const result = await modelCollection.find({ userEmail: email }).toArray();
            res.json(result.map(formatDoc));
        });

        // Add a favorite by model ID
        app.post('/favorites/:id', async (req, res) => {
            const { id } = req.params;
            const { email } = req.body; // user email

            if (!email) return res.status(400).json({ success: false, message: "Email is required" });

            const model = await modelCollection.findOne({ _id: new ObjectId(id) });
            if (!model) return res.status(404).json({ success: false, message: "Model not found" });

            const favorite = { ...model, email };
            const result = await favoriteCollection.insertOne(favorite);
            res.json({ ...favorite, _id: result.insertedId.toString() });
        });


        app.get('/favorites', async (req, res) => {
            const email = req.query.email;
            const result = await favoriteCollection.find({ email }).toArray();
            res.json(result.map(formatDoc));
        });

// Delete a single favorite by its _id
app.delete('/favorites/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await favoriteCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Favorite not found" });
        }
        res.json({ success: true, message: "Favorite removed" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


        console.log("✅ Connected to MongoDB!");
    } finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => res.send("Server running"));
app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
