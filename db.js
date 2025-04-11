const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);
let db;

const connectToDB = async () => {
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME);
    console.log("Connected to MongoDB");
    // Create indexes for better performance
    await db.collection("products").createIndex({ name: "text" });
    await db.collection("products").createIndex({ category: 1 });
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err; // Re-throw to handle in the application
  }
};

const getDB = () => {
  if (!db) throw new Error("Database not connected");
  return db;
};

// PRODUCT CRUD OPERATIONS

/**
 * Add a new product to the database
 * @param {Object} productData - Product data to add
 * @returns {Object} - Result of the operation
 */
const Admin_productadd = async (productData) => {
  try {
    const database = getDB();
    const productsCollection = database.collection("products");

    // Validate required fields
    if (
      !productData.name ||
      !productData.price ||
      !productData.category ||
      !productData.stock
    ) {
      return {
        message: "Missing required fields (name, price, category, stock)",
        status: 400,
      };
    }

    // Validate images
    if (!productData.images || productData.images.length < 2) {
      return {
        message: "At least 2 images are required",
        status: 400,
      };
    }

    if (productData.images.length > 5) {
      return {
        message: "Maximum 5 images allowed",
        status: 400,
      };
    }

    productData = { ...productData, rating: 0 };

    const result = await productsCollection.insertOne({
      ...productData,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      message: "Product added successfully",
      status: 201,
      productId: result.insertedId,
    };
  } catch (error) {
    console.error("Error adding product:", error);
    return {
      message: "Failed to add product",
      status: 500,
      error: error.message,
    };
  }
};

/**
 * Get all products from the database
 * @returns {Object} - List of products or error
 */
const Admin_productget = async () => {
  try {
    const database = getDB();
    const productsCollection = database.collection("products");

    const products = await productsCollection.find({}).toArray();

    return {
      message: "Products retrieved successfully",
      status: 200,
      products,
    };
  } catch (error) {
    console.error("Error getting products:", error);
    return {
      message: "Failed to retrieve products",
      status: 500,
      error: error.message,
    };
  }
};

const Admin_orderget = async () => {
  try {
    const database = getDB();
    const ordersCollection = database.collection("orders");

    const orders = await ordersCollection.find({}).toArray();

    return {
      message: "Orders retrieved successfully",
      status: 200,
      orders,
    };
  } catch (error) {
    console.error("Error getting orders:", error);
    return {
      message: "Failed to retrieve orders",
      status: 500,
      error: error.message,
    };
  }
};

/**
 * Get a single product by ID
 * @param {string} productId - Product ID to retrieve
 * @returns {Object} - Product data or error
 */
const Admin_productgetById = async (productId) => {
  try {
    const database = getDB();
    const productsCollection = database.collection("products");
    console.log("id-----------> ", productId);
    if (!ObjectId.isValid(productId)) {
      return {
        message: "Invalid product ID",
        status: 400,
      };
    }

    const product = await productsCollection.findOne({
      _id: new ObjectId(productId),
    });

    if (!product) {
      return {
        message: "Product not found",
        status: 404,
      };
    }

    return {
      message: "Product retrieved successfully",
      status: 200,
      product,
    };
  } catch (error) {
    console.error("Error getting product:", error);
    return {
      message: "Failed to retrieve product",
      status: 500,
      error: error.message,
    };
  }
};

/**
 * Update a product
 * @param {string} productId - ID of product to update
 * @param {Object} updateData - Data to update
 * @returns {Object} - Result of the operation
 */
const Admin_productedit = async (productId, updateData) => {
  try {
    const database = getDB();
    const productsCollection = database.collection("products");

    if (!ObjectId.isValid(productId)) {
      return {
        message: "Invalid product ID",
        status: 400,
      };
    }

    // Remove immutable fields if present
    delete updateData._id;
    delete updateData.createdAt;

    // Validate images if being updated
    if (updateData.images) {
      if (updateData.images.length < 2) {
        return {
          message: "At least 2 images are required",
          status: 400,
        };
      }
      if (updateData.images.length > 5) {
        return {
          message: "Maximum 5 images allowed",
          status: 400,
        };
      }
    }

    const result = await productsCollection.updateOne(
      { _id: new ObjectId(productId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return {
        message: "Product not found",
        status: 404,
      };
    }

    return {
      message: "Product updated successfully",
      status: 200,
      modifiedCount: result.modifiedCount,
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      message: "Failed to update product",
      status: 500,
      error: error.message,
    };
  }
};

/**
 * Delete a product
 * @param {string} productId - ID of product to delete
 * @returns {Object} - Result of the operation
 */
const Admin_productdelete = async (productId) => {
  try {
    const database = getDB();
    const productsCollection = database.collection("products");

    if (!ObjectId.isValid(productId)) {
      return {
        message: "Invalid product ID",
        status: 400,
      };
    }

    const result = await productsCollection.deleteOne({
      _id: new ObjectId(productId),
    });

    if (result.deletedCount === 0) {
      return {
        message: "Product not found",
        status: 404,
      };
    }

    return {
      message: "Product deleted successfully",
      status: 200,
      deletedCount: result.deletedCount,
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      message: "Failed to delete product",
      status: 500,
      error: error.message,
    };
  }
};

/**
 * Delete a product
 * @param {string} orderId - ID of product to delete
 * @param {string} status - status  of product to delete
 * @returns {Object} - Result of the operation
 */

/**
 * Update an order's status
 * @param {string} orderId - ID of the order to update
 * @param {Object} updateData - Object containing the new status
 * @param {string} updateData.status - New status value
 * @returns {Object} - Result of the operation
 */
const Admin_orderedit = async (orderId, updateData) => {
  try {
    const database = getDB();
    const ordersCollection = database.collection("orders");

    console.log(`Updating order ${orderId} with data:`, updateData);

    // Validate order ID
    if (!ObjectId.isValid(orderId)) {
      return {
        message: "Invalid order ID",
        status: 400,
      };
    }

    // Validate status update
    if (!updateData || !updateData.status) {
      return {
        message: "Status is required for update",
        status: 400,
      };
    }

    const validStatuses = [
      "Order Placed",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];
    if (!validStatuses.includes(updateData.status)) {
      return {
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        status: 400,
      };
    }

    // Update the order
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status: updateData.status } }
    );

    if (result.matchedCount === 0) {
      return {
        message: "Order not found",
        status: 404,
      };
    }

    return {
      message: "Order status updated successfully",
      status: 200,
      modifiedCount: result.modifiedCount,
    };
  } catch (error) {
    console.error("Error updating order:", error);
    return {
      message: "Failed to update order",
      status: 500,
      error: error.message,
    };
  }
};

module.exports = {
  connectToDB,
  getDB,
  Admin_productadd,
  Admin_productget,
  Admin_productgetById,
  Admin_productedit,
  Admin_productdelete,
  Admin_orderget,
  Admin_orderedit,
};
