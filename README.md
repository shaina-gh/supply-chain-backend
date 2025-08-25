# Interactive Supply Chain BI Dashboard (Backend)

This is the backend service for a full-stack Business Intelligence dashboard. It is a Node.js and Express API that connects to a PostgreSQL database, performs data aggregation, and serves the processed data to the frontend application.

**Live API URL**: [https://supply-chain-backend-mf8h.onrender.com](https://supply-chain-backend-mf8h.onrender.com)

---

## 📋 Features

* **RESTful API**: Provides a clean and predictable API for the frontend to consume.
* **Data Aggregation**: Performs complex SQL queries to aggregate raw data into meaningful KPIs (e.g., averages, counts, and groupings).
* **Dynamic Filtering**: The `/api/logistics` endpoint accepts query parameters to dynamically filter the data, allowing for an interactive user experience on the frontend.
* **Secure & Scalable**: Uses parameterized queries to prevent SQL injection and is deployed on Render for reliable, scalable hosting.

## Endpoints

| Method | Endpoint                    | Description                                                              |
| :----- | :-------------------------- | :----------------------------------------------------------------------- |
| `GET`  | `/api/logistics`            | Returns average waiting times per asset. Can be filtered by `?asset=...`. |
| `GET`  | `/api/delay-reasons`        | Returns the count of shipments grouped by delay reason.                  |
| `GET`  | `/api/locations`            | Returns the geospatial data (`lat`, `lon`, `status`) for all assets.     |
| `GET`  | `/api/kpi-summary`          | Returns high-level summary statistics for the dashboard's KPI cards.     |


## 🛠️ Tech Stack

* **Node.js**: The JavaScript runtime environment.
* **Express.js**: The web application framework used to build the API.
* **PostgreSQL**: The relational database for storing the supply chain data.
* **`node-postgres` (pg)**: The Node.js client for PostgreSQL.
* **Render**: For continuous deployment and hosting of the server and database.

## ⚙️ Running Locally

1.  Clone the repository:
    `git clone https://github.com/shaina-gh/supply-chain-backend.git`
2.  Navigate into the directory:
    `cd supply-chain-backend`
3.  Install dependencies:
    `npm install`
4.  Create a `.env` file in the root and add your PostgreSQL database connection URL:
    `DATABASE_URL='your_database_connection_string'`
5.  Start the server:
    `node index.js`

## 📊 Dataset Source

The data for this project was sourced from the **Smart Logistics & Supply Chain Dataset** on Kaggle. It was loaded and processed using the following Python script.

```python
# Install dependencies as needed:
# pip install kagglehub pandas

import kagglehub
from kagglehub import KaggleDatasetAdapter

# Set the path to the file you'd like to load
file_path = "smart_logistics_shipping_data.csv"

# Load the latest version
df = kagglehub.load_dataset(
    KaggleDatasetAdapter.PANDAS,
    "ziya07/smart-logistics-supply-chain-dataset",
    file_path,
)

print("First 5 records:", df.head())
```
