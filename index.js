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

// Function to generate a unique session ID
function generateSessionId() {
  return Math.random().toString(36).substring(2, 8) + "-" + Math.random().toString(36).substring(2, 8);
}

// Connect to MongoDB once and reuse connection
let db;
async function connectMongo() {
  try {
    await client.connect();
    db = client.db("sessions"); // Use the correct database name
    console.log("✅ Successfully connected to MongoDB!");
    await createTTLIndex();

  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1); // Exit if MongoDB connection fails
  }
}
async function createTTLIndex() {
  try {
    const sessionsCollection = db.collection("tokens");
    await sessionsCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 10800 }); // 3 hours = 10800 seconds
    console.log("✅ TTL Index created for automatic session expiration");
  } catch (error) {
    console.error("❌ Error creating TTL index:", error);
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

// **Create Session and Store in MongoDB**
const { ObjectId } = require("mongodb");

app.post("/session", async (req, res) => {
  const { boxid } = req.body;
  
  if (!boxid) {
    return res.status(400).json({ error: "boxid is required" });
  }

  try {
    const sessionid = generateSessionId();
    
    // Set expiration time (3 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 3); 

    // Insert into MongoDB
    const sessionsCollection = db.collection("tokens");
    await sessionsCollection.insertOne({ 
      boxid, 
      sessionid, 
      expiresAt 
    });

    res.json({ response: { boxid, sessionid, expiresAt } });
  } catch (error) {
    console.error("❌ Error creating session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/auth", async (req, res) => {
  const { email } = req.body;
  const boxid = req.headers["boxid"];
  const sessionid = req.headers["sessionid"];

  if (!boxid || !sessionid) {
    return res.status(400).json({ error: "boxid and sessionid are required in headers" });
  }

  try {
    const sessionsCollection = db.collection("tokens");
    console.log("sessionsCollection",{boxid,sessionid})
    // Check if the provided boxid and sessionid exist in the database
    const existingSession = await sessionsCollection.findOne({boxid,sessionid});
console.log("existingSession",existingSession)
    if (!existingSession) {
      return res.status(401).json({ error: "Unauthorized: Invalid boxid or sessionid" });
    }

    // If valid, return success response
    res.json({ message: "Authenticated", email });
  } catch (error) {
    console.error("❌ Error during authentication:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// **Start Server**
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
