const Order = require("../schemas/v1/order.schema");
const Product = require("../schemas/v1/product.schema");

exports.createOrder = async (req, res) => {
  try {
    const { products } = req.body;
    const userId = req.user.userId;

    const productDetails = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product || product.stock < item.quantity) {
          throw new Error("Product not available or insufficient stock");
        }
        product.stock -= item.quantity;
        await product.save();

        return {
          product: product._id,
          quantity: item.quantity,
          price: product.price,
        };
      })
    );

    const order = await Order.create({ userId, products: productDetails });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("products.product").lean();
    const ordersWithTotal = orders.map((order) => {
      let totalPrice = 0;
      let totalProduct = order.products.length;
      order.products.forEach((product) => {
        totalPrice += product.quantity * product.price;
      });
      return {
        ...order,
        totalPrice,
        totalProduct,
      };
    });

    return res.status(200).json(ordersWithTotal);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });
    let totalPrice = 0;
    let totalProduct = order.products.length;
    order.products.forEach((product) => {
      totalPrice += product.quantity * product.price;
    });
    const orderWithTotal = {
      ...order,
      totalPrice,
      totalProduct,
    };

    return res.status(200).json(orderWithTotal);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getOrdersByUserId = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate("products.product")
      .lean();

    const ordersWithTotal = orders.map((order) => {
      let totalPrice = 0;
      let totalProduct = order.products.length;
      order.products.forEach((product) => {
        totalPrice += product.quantity * product.price;
      });
      return {
        ...order,
        totalPrice,
        totalProduct,
      };
    });

    return res.status(200).json(ordersWithTotal);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateOrderById = async (req, res) => {
  try {
    const { products } = req.body;

    // Step 1: Find existing order
    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Map old product quantities for stock adjustment
    const oldProductMap = new Map();
    existingOrder.products.forEach((item) => {
      oldProductMap.set(item.product.toString(), item.quantity);
    });

    const updatedProductDetails = [];
    console.log(products);
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(400)
          .json({ message: `Product not found: ${item.product}` });
      }

      const oldQuantity = oldProductMap.get(item.product) || 0;
      const quantityDifference = item.quantity - oldQuantity;

      // not add product quantity 0
      if (item.quantity === 0) {
        product.stock += oldQuantity;
        await product.save();
        continue;
      }

      if (product.stock < quantityDifference) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for product: ${product.name}` });
      }

      // Update product stock
      product.stock -= quantityDifference;
      await product.save();

      // Add updated product details excluding quantity 0
      updatedProductDetails.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Step 4: Update the order with the new product list (excluding products with quantity 0)
    existingOrder.products = updatedProductDetails;
    await existingOrder.save();

    return res
      .status(200)
      .json({ message: "Order updated successfully", order: existingOrder });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteOrderById = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.restockThenDeleteOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.products.forEach(async (item) => {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    });

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
