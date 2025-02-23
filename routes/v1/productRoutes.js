const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../../controllers/productControllers");
const { verifyAccessToken } = require("../../middlewares/auth");
const router = express.Router();

router.post("/", verifyAccessToken, createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", verifyAccessToken, updateProduct);
router.delete("/:id", verifyAccessToken, deleteProduct);

module.exports = router;
