require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Use environment variables for credentials
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://madhu:Y2Uzso0HTdkKiuRy@users.fof7b.mongodb.net/?retryWrites=true&w=majority&appName=users";
const client = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to MongoDB once, reuse connection
let db;
async function connectMongo() {
  try {
    await client.connect();
    db = client.db("users");
    console.log("✅ Successfully connected to MongoDB!");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
  }
}
connectMongo();

// ✅ Get Real Client IP
app.set("trust proxy", true);

// **Simple Routes**
app.get("/", (req, res) => {
  const clientIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip;
  res.send(`Your IP is: ${clientIP}`);
});

app.get("/user/:id", (req, res) => {
  res.send(req.params.id);
});

// **POST Request Example**
app.post("/data", (req, res) => {
  const { name, age } = req.body;
  res.json({ message: `Hello ${name}, you are ${age} years old.` });
});

// **Fetch Movies from MongoDB**
app.get("/movies", async (req, res) => {
  try {
    const database = client.db("sample_mflix");
    const collection = database.collection("movies");

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (page - 1) * limit;

    const movies = await collection.find({}).skip(skip).limit(limit).toArray();
    res.json({ data: movies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// **Fetch Planets from MongoDB**
app.get("/planets", async (req, res) => {
  try {
    const database = client.db("sample_guides");
    const collection = database.collection("planets");

    const planets = await collection.find({}).toArray();
    res.json(planets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// **Insert/Update Document**
app.post("/pagination_test", async (req, res) => {
  try {
    const { _id, name } = req.body;
    if (!_id || !name) {
      return res.status(400).json({ message: "_id and name are required" });
    }

    const database = client.db("sample_guides");
    const collection = database.collection("pagination_test");

    const filter = { _id };
    const updateDoc = { $set: { name } };
    const options = { upsert: true };

    const result = await collection.updateOne(filter, updateDoc, options);
    res.json({ message: result.matchedCount > 0 ? "Document updated" : "Document inserted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// **Delete Document**
app.delete("/pagination_test", async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ message: "_id is required" });
    }

    const database = client.db("sample_guides");
    const collection = database.collection("pagination_test");

    const result = await collection.deleteOne({ _id });

    res.json({ message: result.deletedCount === 1 ? "Document deleted" : "Document not found" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// **Start Server**
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
