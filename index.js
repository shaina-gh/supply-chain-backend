const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000; // Render will set the PORT environment variable

// Middleware
app.use(cors());
app.use(express.json());

// Create a new Pool instance to connect to your database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render will provide this
  ssl: {
    rejectUnauthorized: false,
  },
});

// --- API ENDPOINTS ---

// A simple test route to make sure the server is running
app.get("/", (req, res) => {
  res.send("Supply Chain API is running!");
});

// An endpoint to get all logistics data
app.get("/api/logistics", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM logistics_data ORDER BY timestamp DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
