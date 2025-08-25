require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get("/", (req, res) => {
  res.send("Supply Chain API is running!");
});

// ROUTE FOR BAR CHART & FILTER
app.get("/api/logistics", async (req, res) => {
  const { asset } = req.query;
  let sqlQuery = `
    SELECT
      asset_id,
      ROUND(AVG(waiting_time)::numeric, 2) AS average_waiting_time
    FROM logistics_data
  `;
  const queryParams = [];

  if (asset && asset !== "All") {
    sqlQuery += ` WHERE asset_id = $1`;
    queryParams.push(asset);
  }

  sqlQuery += ` 
    GROUP BY asset_id 
    ORDER BY CAST(SUBSTRING(asset_id FROM 'Truck_(\\d+)') AS INTEGER);
  `;

  try {
    const result = await pool.query(sqlQuery, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ROUTE FOR PIE CHART
app.get("/api/delay-reasons", async (req, res) => {
  const sqlQuery = `
        SELECT 
          logistics_delay_reason, 
          CAST(COUNT(*) AS INTEGER) AS count
        FROM logistics_data
        WHERE logistics_delay_reason IS NOT NULL
        GROUP BY logistics_delay_reason
        ORDER BY count DESC;
      `;
  try {
    const result = await pool.query(sqlQuery);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ROUTE FOR MAP
app.get("/api/locations", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT asset_id, latitude, longitude, shipment_status FROM logistics_data;"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching location data:", err);
    res.status(500).send("Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
