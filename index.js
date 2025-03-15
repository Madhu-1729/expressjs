const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");

const password = encodeURIComponent('Y2Uzso0HTdkKiuRy')
const uri = "mongodb+srv://madhu:Y2Uzso0HTdkKiuRy@users.fof7b.mongodb.net/?retryWrites=true&w=majority&appName=users";
const app = express();
const PORT = 3009;

// Middleware to parse JSON
app.use(express.json());

app.set("trust proxy", true);


// Simple GET API
app.get("/", (req, res) => {
  res.send("your Remote address is="+req.socket.remoteAddress+"| Your IP is="+req.ip+"\\"+ req.headers["x-forwarded-for"] );
});

app.get("/user/:id", (req, res) => {
  res.send(req.params.id);
});

// Simple POST API
app.post("/data", (req, res) => {
  const { name, age } = req.body;
  res.json({ message: `Hello ${name}, you are ${age} years old.` });
});

// MongoDB connection setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Global variable to hold the connected database
let db;

// Function to connect to MongoDB
async function connectMongo() {
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    db = client.db("users"); // Use the "users" database
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// Connect to MongoDB before starting the server
connectMongo();

// Route to fetch users from MongoDB (example)
app.get("/movies", async (req, res) => {
    try {
      console.log(req)
        const database = client.db("sample_mflix");
        const collection = database.collection("movies");

        // Get query parameters (default page = 1, limit = 10)
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        let skip = (page - 1) * limit;

        // Fetch movies with pagination
        const movies = await collection.find({})
            .skip(skip)
            .limit(limit)
            .toArray();

        res.json({"data":req.ip});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/planets", async (req, res) => {
    try {
        // await client.connect();
        const database = client.db("sample_guides");
        const collection = database.collection("planets");
console.log(collection)
        // Fetch all documents
        const planets = await collection.find({}).toArray();
        
        res.json(planets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    } finally {
        await client.close();
    }
});


app.post("/pagination_test", async (req, res) => {
  try {
    const { _id, name } = req.body;
    console.log("post----",+_id,name)

    if (!_id || !name) {
      return res.status(400).json({ message: "_id and name are required" });
    }

    const database = client.db("sample_guides");
    const collection = database.collection("pagination_test");

    const filter = { _id: _id };
    const updateDoc = { $set: { name: name } };
    const options = { upsert: true }; // Inserts if document doesn't exist

    const result = await collection.updateOne(filter, updateDoc, options);
console.log("------------",result)
    if (result.matchedCount > 0) {
      res.json({ message: "Document updated successfully" });
    } else {
      res.json({ message: "Document inserted successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/pagination_test", async (req, res) => {
  try {
    console.log("delete----",+req.body)

    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ message: "_id is required" });
    }

    const database = client.db("sample_guides");
    const collection = database.collection("pagination_test");

    const result = await collection.deleteOne({ _id: _id });

    if (result.deletedCount === 1) {
      res.json({ message: "Document deleted successfully" });
    } else {
      res.status(404).json({ message: "Document not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});




// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
