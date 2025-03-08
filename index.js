const express = require("express");
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Simple GET API
app.get("/", (req, res) => {
    res.send("Welcome to Express API restarted nodemon!");
});

// Simple POST API
app.post("/data", (req, res) => {
    const { name, age } = req.body;
    res.json({ message: `Hello ${name}, you are ${age} years old.` });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
