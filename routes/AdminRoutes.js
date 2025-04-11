const express = require("express");
const {
  Admin_productadd,
  Admin_productget,
  Admin_productgetById,
  Admin_productedit,
  Admin_productdelete,
  Admin_orderget,
  Admin_orderedit,
} = require("../db");
const router = express.Router();

// Add a new product
router.post("/add-product", async (req, res) => {
  try {
    console.log("Admin adding product:", req.body);

    const {
      name,
      description,
      price,
      category,
      stock,
      specifications,
      images,
      mainImageIndex,
    } = req.body;

    // Validate required fields
    if (!name || !price || !category || !stock || !images?.length) {
      return res.status(400).json({
        status: 400,
        message:
          "Missing required fields (name, price, category, stock, or images)",
      });
    }

    // Validate image count
    if (images.length < 2) {
      return res.status(400).json({
        status: 400,
        message: "At least 2 images are required",
      });
    }

    if (images.length > 5) {
      return res.status(400).json({
        status: 400,
        message: "Maximum 5 images allowed",
      });
    }

    const result = await Admin_productadd(req.body);

    if (result.status !== 201) {
      return res.status(result.status).json(result);
    }

    return res.status(201).json({
      status: 201,
      message: "Product added successfully",
      productId: result.productId,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get all products
router.get("/products", async (req, res) => {
  try {
    console.log("Fetching all products");
    const result = await Admin_productget();

    if (result.status !== 200) {
      return res.status(result.status).json(result);
    }

    return res.status(200).json({
      status: 200,
      message: "Products retrieved successfully",
      products: result.products,
    });
  } catch (error) {
    console.error("Error getting products:", error);
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve products",
      error: error.message,
    });
  }
});

// Get single product by ID
router.get("/products/:id", async (req, res) => {
  try {
    console.log(req, req.params.id);
    console.log(`Fetching product with ID: ${req.params.id}`);
    const result = await Admin_productgetById(req.params.id);

    if (result.status !== 200) {
      return res.status(result.status).json(result);
    }

    return res.status(200).json({
      status: 200,
      message: "Product retrieved successfully",
      product: result.product,
    });
  } catch (error) {
    console.error("Error getting product:", error);
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve product",
      error: error.message,
    });
  }
});

// Update a product
router.put("/products/:id", async (req, res) => {
  try {
    console.log(`Updating product with ID: ${req.params.id}`);

    const result = await Admin_productedit(req.params.id, req.body);

    if (result.status !== 200) {
      return res.status(result.status).json(result);
    }

    return res.status(200).json({
      status: 200,
      message: "Product updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      status: 500,
      message: "Failed to update product",
      error: error.message,
    });
  }
});

// Delete a product
router.delete("/products/:id", async (req, res) => {
  try {
    console.log(`Deleting product with ID: ${req.params.id}`);
    const result = await Admin_productdelete(req.params.id);

    if (result.status !== 200) {
      return res.status(result.status).json(result);
    }

    return res.status(200).json({
      status: 200,
      message: "Product deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      status: 500,
      message: "Failed to delete product",
      error: error.message,
    });
  }
});

router.get("/stats", async (req, res) => {
  try {
    console.log("Fetching admin dashboard stats");

    // Get products
    const productsResult = await Admin_productget();
    if (productsResult.status !== 200) {
      return res.status(productsResult.status).json(productsResult);
    }
    const totalProducts = productsResult.products?.length || 0;

    // Get orders
    const ordersResult = await Admin_orderget();
    if (ordersResult.status !== 200) {
      return res.status(ordersResult.status).json(ordersResult);
    }
    const orders = ordersResult.orders || [];
    const totalOrders = orders.length;

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (order.total || 0);
    }, 0);

    return res.status(200).json({
      status: 200,
      message: "Dashboard stats retrieved successfully",
      stats: {
        totalProducts,
        newOrders: totalOrders, // Or you might want to filter for new orders only
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve dashboard stats",
      error: error.message,
    });
  }
});

router.patch("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    console.log(`Updating order ${orderId} status to ${status}`);

    // Validate status
    const validStatuses = [
      "Order Placed",
      "Processing",
      "Shipped",
      "Delivered",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 400,
        message:
          "Invalid status. Must be one of: Order Placed, Processing, Shipped, Delivered",
      });
    }

    // Update order in database
    const result = await Admin_orderedit(orderId, { status });

    if (result.status !== 200) {
      return res.status(result.status).json(result);
    }

    return res.status(200).json({
      status: 200,
      message: "Order status updated successfully",
      order: result.order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      status: 500,
      message: "Failed to update order status",
      error: error.message,
    });
  }
});

module.exports = router;
