
const express = require("express");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");

const password = encodeURIComponent('Y2Uzso0HTdkKiuRy');
const uri = `mongodb+srv://madhu:${password}@users.fof7b.mongodb.net/?retryWrites=true&w=majority&appName=users`;
const app = express();
const PORT = 3009;

// Middleware to parse JSON
app.use(express.json());

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

// Simple GET API
app.get("/", (req, res) => {
  res.send("Welcome to Express API!");
});

// Get a user by ID
app.get("/user/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (user) {
      res.json(user);
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).send("Error retrieving user");
  }
});

// Create a new user (POST)
app.post("/users", async (req, res) => {
  const { name, age } = req.body;

  try {
    const newUser = {
      name,
      age,
    };

    const result = await db.collection("users").insertOne(newUser);
    res.status(201).json({
      message: "User created successfully",
      user: { _id: result.insertedId, ...newUser },
    });
  } catch (err) {
    res.status(500).send("Error creating user");
  }
});

// Update a user's details (PUT)
app.put("/user/:id", async (req, res) => {
  const userId = req.params.id;
  const { name, age } = req.body;

  try {
    const updatedUser = {
      name,
      age,
    };

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: updatedUser }
    );

    if (result.modifiedCount > 0) {
      res.json({ message: "User updated successfully", updatedUser });
    } else {
      res.status(404).send("User not found or no changes made");
    }
  } catch (err) {
    res.status(500).send("Error updating user");
  }
});

// Delete a user (DELETE)
app.delete("/user/:id", async (req, res) => {
  const userId = req.params.id;
  
  try {
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount > 0) {
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).send("Error deleting user");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
