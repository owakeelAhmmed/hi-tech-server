require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

// const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.x9mq9p5.mongodb.net/?retryWrites=true&w=majority`;

const uri =
  "mongodb+srv://owakeelahmmed:vN3bvP6mQ364N1do@cluster0.x9mq9p5.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    const db = client.db("hi-tech");
    const productCollection = db.collection("products");

    //====================================================
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find({});
      const product = await cursor.toArray();

      res.send({ status: true, data: product });
    });

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const result = await productCollection.findOne({ _id: new ObjectId(id) });

      res.send({ status: true, data: result });
    });
    //====================================================

    app.post("/product", async (req, res) => {
      const product = req.body;

      const result = await productCollection.insertOne(product);

      res.send(result);
    });

    app.patch("/product/:id", async (req, res) => {
      const productId = req.params.id;
      const updatedProduct = req.body;

      try {
        const db = client.db("hi-tech");
        const productCollection = db.collection("products");

        const result = await productCollection.updateOne(
          { _id: ObjectId(productId) },
          { $set: updatedProduct }
        );

        if (result.modifiedCount === 1) {
          res.json({ message: "Product updated successfully" });
        } else {
          res.json({ error: "Product not found or not updated" });
        }
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;

      const result = await productCollection.deleteOne({ _id: ObjectId(id) });

      res.send(result);
    });

    app.post("/comment/:id", async (req, res) => {
      const productId = req.params.id;
      const comment = req.body.comment;

      const result = await productCollection.updateOne(
        { _id: ObjectId(productId) },
        { $push: { comments: comment } }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error("Product not found or comment not added");
        res.json({ error: "Product not found or comment not added" });
        return;
      }

      res.json({ message: "Comment added successfully" });
    });

    app.get("/comment/:id", async (req, res) => {
      const productId = req.params.id;

      const result = await productCollection.findOne(
        { _id: ObjectId(productId) },
        { projection: { _id: 0, comments: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    });

    app.post("/user", async (req, res) => {
      const user = req.body;

      const result = await userCollection.insertOne(user);

      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;

      const result = await userCollection.findOne({ email });

      if (result?.email) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });
    app.get("/search", async (req, res) => {
      const query = req.query.q;
      console.log("Received query:", query);
      if (!query || query.trim() === "") {
        // If no valid query is provided, send an appropriate response
        res.send({ status: false, message: "Invalid search query" });
        return;
      }

      const cursor = productCollection.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { author: { $regex: query, $options: "i" } },
          { genre: { $regex: query, $options: "i" } },
        ],
      });

      const results = await cursor.toArray();

      res.send({ status: true, data: results });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Server Working!");
});

app.listen(port, () => {
  console.log(`Application listening on port ${port}`);
});
