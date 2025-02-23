const express = require("express");

const { verifyAccessToken } = require("../../middlewares/auth");
const {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  updateOrderById,
  deleteOrderById,
  restockThenDeleteOrderById,
} = require("../../controllers/orderControllers");

const router = express.Router();

router.post("/", verifyAccessToken, createOrder);
router.get("/", verifyAccessToken, getAllOrders);
router.get("/:id", verifyAccessToken, getOrderById);
router.get("/getOrdersByUserId/:userId", verifyAccessToken, getOrdersByUserId);
router.put("/:id", verifyAccessToken, updateOrderById);
router.delete("/:id", verifyAccessToken, deleteOrderById);
router.delete(
  "/restockThenDelete/:id",
  verifyAccessToken,
  restockThenDeleteOrderById
);

module.exports = router;
