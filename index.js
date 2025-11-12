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

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

async function run() {
    try {
        await client.connect();
        const db = client.db('artify-db');
        const modelCollection = db.collection('Artify');
        const favoriteCollection = db.collection('favorites');

        // Helper function to convert _id to string
        const formatDoc = (doc) => ({ ...doc, _id: doc._id.toString() });

        // Get all artworks
        app.get('/Artify', async (req, res) => {
            const result = await modelCollection.find().toArray();
            res.json(result.map(formatDoc));
        });

        // Get single artwork
        app.get('/Artify/:id', async (req, res) => {
            const { id } = req.params;
            const result = await modelCollection.findOne({ _id: new ObjectId(id) });
            if (!result) return res.status(404).json({ success: false, message: "Artwork not found" });
            res.json({ success: true, result: formatDoc(result) });
        });

        // Get latest 6 artworks
       app.get('/home-arts', async (req, res) => {
    try {
        const arts = await modelCollection
            .find({})
            .sort({ _id: -1 })  // 👈 newest first
            .limit(6)
            .toArray();

        res.json(arts.map(formatDoc));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


        // Top artists example
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

        // Add new artwork
        app.post('/Artify', async (req, res) => {
            const data = req.body;
            const result = await modelCollection.insertOne(data);
            // Return inserted document with _id as string
            res.json({ ...data, _id: result.insertedId.toString() });
        });

        // Update artwork
        app.put('/Artify/:id', async (req, res) => {
            const { id } = req.params;
            const updatedModel = req.body;
            const result = await modelCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedModel }
            );
            res.json(result);
        });

        // Delete artwork
        app.delete('/Artify/:id', async (req, res) => {
            const { id } = req.params;
            const result = await modelCollection.deleteOne({ _id: new ObjectId(id) });
            res.json(result);
        });

        // PATCH Like Route
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

        // My Artworks
        app.get('/MyModels', async (req, res) => {
            const email = req.query.email;
            if (!email) return res.json([]);
            const result = await modelCollection.find({ userEmail: email }).toArray();
            res.json(result.map(formatDoc));
        });

        // Add to favorites
        app.post('/favorites', async (req, res) => {
            const data = req.body;
            const result = await favoriteCollection.insertOne(data);
            res.json({ ...data, _id: result.insertedId.toString() });
        });

        // Get favorites by user email
        app.get('/Myfavorites', async (req, res) => {
            const email = req.query.email;
            const result = await favoriteCollection.find({ email }).toArray();
            res.json(result.map(formatDoc));
        });

        // Remove favorite
        app.delete('/favorites/:id', async (req, res) => {
            const { id } = req.params;
            const result = await favoriteCollection.deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount > 0) {
                res.json({ success: true, message: "Removed from favorites" });
            } else {
                res.status(404).json({ success: false, message: "Favorite not found" });
            }
        });

        console.log("✅ Connected to MongoDB!");
    } finally {
        // Keep the connection open
    }
}

run().catch(console.dir);

app.get('/', (req, res) => res.send("Server running"));
app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
