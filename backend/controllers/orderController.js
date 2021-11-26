const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");

//Create new order
exports.newOrder = async (req, res, next) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Get single order
exports.getSingleOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return next(new ErrorHandler("order not found", 404));
    }

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Get logged in user order
exports.myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    });

    if (!orders) {
      return next(new ErrorHandler("order not found", 404));
    }

    res.status(201).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Get All Order -- Admin\
exports.getAllOrder = async (req, res, next) => {
  try {
    const orders = await Order.find();

    if (!orders) {
      return next(new ErrorHandler("order not found", 404));
    }

    let totalAmount = 0;

    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });

    res.status(201).json({
      success: true,
      orders,
      totalAmount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Update order status -- Admin
exports.updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order.orderStatus === "Delivered") {
      return next(new ErrorHandler("You have delivered this order", 404));
    }

    order.orderItems.forEach(async (order) => {
      await updateStock(order.product, order.quantity);
    });

    order.orderStatus = req.body.status;

    if(req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save({validateBeforeSave: false});

    res.status(201).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stock = product.stock - quantity;

  await product.save({
    validateBeforeSave: false
  })
}

//Delete order -
//Get All Order -- Admin\
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("order not found", 404));
    }

    await order.remove()

    res.status(201).json({
      success: true
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};