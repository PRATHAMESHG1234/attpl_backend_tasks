const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

const uri = process.env.MONGODB_URI; // Use environment variable for MongoDB connection string
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/products", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("attpl_tasks");
    const products = database.collection("products");
    const data = await products.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    await client.close();
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

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
