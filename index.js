require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  //connectionString: process.env.DATABASE_URL,
  connectionString:'postgresql://supply_chain_db_shaina_user:7YQipxO3utAs2bJOp3a5xVxOAie3nlTQ@dpg-d2m33sn5r7bs73e9b2n0-a.oregon-postgres.render.com/supply_chain_db_shaina',
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get("/", (req, res) => {
  res.send("Supply Chain API is running!");
});

// --- ROUTE FOR BAR CHART & FILTER ---
app.get("/api/logistics", async (req, res) => {
  const { asset, startDate, endDate } = req.query;
  let sqlQuery = `
    SELECT
      asset_id,
      ROUND(AVG(waiting_time)::numeric, 2) AS average_waiting_time
    FROM logistics_data
  `;
  const queryParams = [];
  let whereClause = [];

  if (asset && asset !== 'All') {
    queryParams.push(asset);
    whereClause.push(`asset_id = $${queryParams.length}`);
  }
  if (startDate && endDate) {
    queryParams.push(startDate, endDate);
    whereClause.push(`timestamp BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`);
  }

  if (whereClause.length > 0) {
    sqlQuery += ` WHERE ${whereClause.join(' AND ')}`;
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

// --- ROUTE FOR PIE CHART ---
app.get('/api/delay-reasons', async (req, res) => {
    // Note: Add date filtering logic here as well if needed
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
        res.status(500).send('Server Error');
      }
});

// --- ROUTE FOR KPI CARDS ---
app.get('/api/kpi-summary', async (req, res) => {
    try {
      const totalShipmentsQuery = 'SELECT COUNT(*) AS total_shipments FROM logistics_data;';
      const avgWaitingTimeQuery = 'SELECT ROUND(AVG(waiting_time)) AS avg_waiting_time FROM logistics_data;';
      const topDelayReasonQuery = `
        SELECT logistics_delay_reason FROM logistics_data
        WHERE logistics_delay_reason IS NOT NULL
        GROUP BY logistics_delay_reason
        ORDER BY COUNT(*) DESC
        LIMIT 1;
      `;

      const [totalShipmentsRes, avgWaitingTimeRes, topDelayReasonRes] = await Promise.all([
        pool.query(totalShipmentsQuery),
        pool.query(avgWaitingTimeQuery),
        pool.query(topDelayReasonQuery)
      ]);

      res.json({
        totalShipments: totalShipmentsRes.rows[0].total_shipments,
        avgWaitingTime: avgWaitingTimeRes.rows[0].avg_waiting_time,
        topDelayReason: topDelayReasonRes.rows[0]?.logistics_delay_reason || 'N/A'
      });

    } catch (err) {
      console.error('Error fetching KPI summary:', err);
      res.status(500).send('Server Error');
    }
});

// --- ROUTE FOR MAP ---
app.get('/api/locations', async (req, res) => {
    try {
      const result = await pool.query('SELECT asset_id, latitude, longitude, shipment_status FROM logistics_data;');
      res.json(result.rows);
    } catch (err) { // <-- Add the missing opening curly brace
  console.error('Error fetching location data:', err);
  res.status(500).send('Server Error');
}


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
})