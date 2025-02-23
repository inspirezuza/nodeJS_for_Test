// const Product = require("../schemas/v1/product.schema.js");

const Product = require("../schemas/v1/product.Schema");

exports.createProduct = async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    const createdBy = req.user.userId;

    const product = await Product.create({ name, price, stock, createdBy });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        stock: stock ?? 0,
        updatedAt: Date.now(),
        createdBy: req.user.userId,
      },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
