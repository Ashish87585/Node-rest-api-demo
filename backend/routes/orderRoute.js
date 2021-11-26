const express = require("express");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");
const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, newOrder);
router
  .route("/order/:id")
  .get(isAuthenticatedUser, getSingleOrder);
router.route("/orders/me").get(isAuthenticatedUser, myOrders);
router.route("/orders").get(isAuthenticatedUser, authorizedRoles("admin"), myOrders);
router.route("/admin/orders").get(isAuthenticatedUser, authorizedRoles("admin"), getAllOrder);
router.route("/admin/order/:id").put(isAuthenticatedUser, authorizedRoles("admin"), updateOrder);
router.route("/admin/order/:id").delete(isAuthenticatedUser, authorizedRoles("admin"), deleteOrder);

module.exports = router;
