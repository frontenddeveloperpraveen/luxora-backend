const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectToDB } = require("./db.js");
const productRoutes = require("./routes/productRoutes.js");
const AdminRoutes = require("./routes/AdminRoutes.js");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Simple home route
app.get("/", (req, res) => {
  res.type("text").send("Server is running");
});

app.get("/index", (req, res) => {
  res.type("text").send("index Server is running");
});

// Your existing routes
app.use("/api/user", productRoutes);
app.use("/api/admin", AdminRoutes);

const startServer = async () => {
  await connectToDB();

  app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
  });
};

startServer();
