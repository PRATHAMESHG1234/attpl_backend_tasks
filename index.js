const express = require("express");
const { MongoClient } = require("mongodb");
const cron = require("node-cron");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const uri = process.env.MONGODB_URI;
console.log(uri); // Use environment variable for MongoDB connection string
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to fetch products from MongoDB
async function fetchProducts() {
  try {
    await client.connect();
    const database = client.db("attpl_tasks");
    const products = database.collection("products");
    const data = await products.find().toArray();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return null;
  } finally {
    await client.close();
  }
}

// Define a cron job to fetch products every minute (change schedule as needed)
cron.schedule("* * * * *", async () => {
  const products = await fetchProducts();
  if (products) {
    console.log("Fetched products:", products);
  } else {
    console.log("Failed to fetch products.");
  }
});

// Connect to MongoDB when the server starts
async function startServer() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server is listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

startServer();

// API endpoint to fetch products
app.get("/products", async (req, res) => {
  try {
    const products = await fetchProducts();
    if (products) {
      res.json(products);
    } else {
      res.status(500).send("Failed to fetch products.");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await client.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    process.exit(1);
  }
});
