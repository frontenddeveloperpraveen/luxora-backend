const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../db.js");

const router = express.Router();

// GET all products
router.get("/products", async (req, res) => {
  try {
    const db = getDB();
    const products = await db.collection("products").find().toArray();
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// GET product by ID
router.get("/products/:id", async (req, res) => {
  try {
    console.log("GEtting rooduct id", req.params.id);

    const db = getDB();
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    console.log(product);
    res.status(200).json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// ADD a new comment
router.post("/review/:id", async (req, res) => {
  console.log("Request for comment upload");

  const { username, comment, star, verified } = req.body;
  const productId = req.params.id;

  if (!username || !comment || !star) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const db = getDB();

    const commentData = {
      username,
      comment,
      star,
      verified: verified ?? false,
      productId: new ObjectId(productId),
      createdAt: new Date(),
    };

    console.log("Data ", commentData);

    // 1. Insert comment
    await db.collection("comments").insertOne(commentData);

    // 2. Fetch all comments for that product
    const comments = await db
      .collection("comments")
      .find({ productId: new ObjectId(productId) })
      .toArray();

    // 3. Calculate average rating
    const totalStars = comments.reduce((acc, cur) => acc + Number(cur.star), 0);
    const avgRating = comments.length ? totalStars / comments.length : 0;

    // 4. Update product with new average rating
    await db.collection("products").updateOne(
      { _id: new ObjectId(productId) },
      {
        $set: {
          rating: avgRating,
        },
      }
    );

    // 5. Send response
    res.status(201).json({
      message: "Comment added successfully",
      comment: commentData,
      updatedRating: avgRating,
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

// GET all comments for a specific product
router.get("/review/:id/", async (req, res) => {
  console.log("Request for comments");
  const productId = req.params.id;

  try {
    const db = getDB();
    const comments = await db
      .collection("comments")
      .find({ productId: new ObjectId(productId) })
      .sort({ createdAt: -1 }) // Latest first
      .toArray();

    console.log("Comments", comments);
    res.status(200).json(comments);

    console.log(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

router.post("/buy", async (req, res) => {
  const request = req.body;

  const data = {
    userId: request.userId,
    items: request.items,
    shippingAddress: request.shippingAddress,
    paymentMethod: request.paymentMethod,
    paymentDetails: request.paymentDetails,
    total: request.total,
    status: request.status ?? "pending",
    createdAt: new Date(),
  };

  console.log("Saving ->", data);

  try {
    const db = getDB();
    const result = await db.collection("orders").insertOne(data);

    res.status(201).json({
      message: "Order placed successfully",
      orderId: result.insertedId,
      order: data,
    });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ message: "Failed to place order" });
  }
});

router.get("/orders/:id", async (req, res) => {
  const userId = req.params.id;

  console.log("Fetching USer orders");

  try {
    const db = getDB();
    let orders;

    if (userId === "1") {
      orders = await db
        .collection("orders")
        .find({}) // Fetch all orders for admin (userId 1)
        .sort({ createdAt: -1 })
        .toArray();
    } else {
      orders = await db
        .collection("orders")
        .find({ userId: userId.toString() }) // Convert userId to string if needed
        .sort({ createdAt: -1 })
        .toArray();
    }

    console.log("Fetched orders:", orders);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;
