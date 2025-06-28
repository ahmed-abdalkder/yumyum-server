 "use strict";
import cartModel from "../../../db/models/cart.model.js";
import foodModel from "../../../db/models/food.model.js";
import orderModel from "../../../db/models/order.model.js";
import { sendEmail } from "./../../service/sendemail.js";
import { createInvoice } from "../../service/pdf.js";
import Stripe from "stripe";
import { payment } from "../../../payment.js";
import { asyncHandeler } from "../../utils/asyncHandeler.js";
import { AppError } from "../../utils/classAppError.js";

export const createOrder = asyncHandeler(async (req, res, next) => {
  const { paymentmethod, phone, address } = req.body;

  const cart = await cartModel.findOne({ user: req.user._id });
  if (!cart || !cart.foods || !cart.foods.length) {
    return next(new AppError("Cart is empty"));
  }

  const foods = cart.foods;
  const finalFoods = [];
  let subprice = 0;

  for (let item of foods) {
    const food = await foodModel.findById(item.foodId);
    if (!food) return next(new AppError("Food not found"));

    const variant = food.variants.find(
      (v) => v._id.toString() === item.variantId?.toString(),
    );

    if (item.variantId && !variant) {
      return next(new AppError("Variant not found"));
    }

    const unitPrice = variant ? variant.subprice : food.price;
    const finalPrice = unitPrice * item.quantity;
    subprice += finalPrice;

    finalFoods.push({
      foodId: item.foodId,
      title: food.title,
      quantity: item.quantity,
      price: unitPrice,
      finalPrice,
      variantId: item.variantId || null,
    });
  }

  const totalPrice = subprice;

  const order = await orderModel.create({
    user: req.user._id,
    foods: finalFoods,
    paymentMethod: paymentmethod,
    address,
    phone,
    subPrice: subprice,
    totalPrice,
    status: paymentmethod === "cash" ? "placed" : "waitPayment",
  });

  await cartModel.updateOne(
    { user: req.user._id },
    { foods: [], totalCartPrice: 0 },
  );

  // const invoice = {
  //   shipping: {
  //     name: req.user.name,
  //     address: order.address,
  //     city: "Cairo",
  //     state: "Cairo",
  //     country: "Egypt",
  //     postal_code: 94111,
  //   },
  //   items: order.foods.map((item) => {
  //     return {
  //       title: item.title,
  //       price: item.price,
  //       quantity: item.quantity,
  //       finalprice: item.finalPrice,
  //     };
  //   }),
  //   subtotal: order.subPrice,
  //   paid: order.totalPrice,
  //   invoice_nr: order._id,
  //   Date: order.createdAt,
  // };

  // await createInvoice(invoice, "invoice.pdf");

  // await sendEmail(req.user.email, "hello", "your order has been succeeded", [
  //   {
  //     path: "./public/invoice.pdf",
  //     contentType: "application/pdf",
  //   },
    
  // ]);

  if (paymentmethod == "card") {
    const stripe = new Stripe(process.env.stripe_secret);

    if (req.body?.coupon) {
      const coupon = await stripe.coupons.create({
        percent_off: req.body.coupon.amount,
        duration: "once",
      });
      req.body.couponId = coupon.id;
    }

    const session = await payment({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      metadata: { orderId: order._id.toString() },
      success_url: `${req.protocol}://localhost:5173/orders/success/${order._id}`,
      cancel_url: `${req.protocol}://localhost:5173/orders/cancel/${order._id}`,
      line_items: order.foods.map((item) => {
        const name = `${item.foodId.title}${item.variantId?.label ? ` (${item.variantId.label})` : ""}`;
        return {
          price_data: {
            currency: "egp",
            product_data: {
              name,
            },
            unit_amount: item.price * 100,
          },
          quantity: item.quantity,
        };
      }),

      discounts: req.body?.coupon ? [{ coupon: req.body.couponId }] : [],
    });

    return res.status(201).json({ msg: "added", url: session.url });
  }
  return res.status(201).json({ message: "Order placed", order });
});

export const CancelOrder = asyncHandeler(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await orderModel.findOne({ _id: id, user: req.user._id });
  if (!order) {
    return next(new AppError("Order does not exist"));
  }
  if (
    (order.paymentMethod === "cash" && order.status !== "placed") ||
    (order.paymentMethod === "card" && order.status !== "waitPayment")
  ) {
    return next(new AppError("Order cannot be cancelled"));
  }
  await orderModel.updateOne(
    { _id: id },
    {
      status: "cancelled",
      cancelledBy: req.user._id,
      reason,
    },
  );

  res.status(200).json({ msg: "Order cancelled successfully" });
});

export const getAllOrders = asyncHandeler(async (req, res, next) => {
  const orders = await orderModel
    .find({ user: req.user._id })
    .populate({
      path: "foods.foodId",
      select: "title image variants",
    })
    .sort({ createdAt: -1 });

  if (!orders || orders.length === 0) {
    return res.status(200).json({
      message: "No orders found.",
      count: 0,
      orders: [],
    });
  }

  const result = orders.map((order) => {
    const foods = order.foods.map((item) => {
      const food = item.foodId;
      let variantData = null;

      if (item.variantId && food.variants && food.variants.length > 0) {
        variantData = food.variants.find(
          (v) => v._id.toString() === item.variantId?.toString()
        );
      }

      return {
        foodId: {
          _id: food._id,
          title: food.title,
          image: food.image,
        },
        quantity: item.quantity,
        price: item.price,
        finalPrice: item.finalPrice,
        variantId: item.variantId,
        variant: variantData
          ? { label: variantData.label, subprice: variantData.subprice }
          : null,
      };
    });

    return {
      ...order._doc,
      foods,
    };
  });

  res.status(200).json({
    message: "Orders fetched successfully",
    count: result.length,
    orders: result,
  });
});

export const getOrders = asyncHandeler(async (req, res, next) => {
  const orders = await orderModel
    .find({}).populate({
      path: "foods.foodId",
      select: "title image variants",
    })
    .sort({ createdAt: -1 });

  if (!orders || orders.length === 0) {
    return res.status(200).json({
      message: "No orders found.",
      count: 0,
      orders: [],
    });
  }

  const result = orders.map((order) => {
    const foods = order.foods.map((item) => {
      const food = item.foodId;
      let variantData = null;

      if (item.variantId && food.variants && food.variants.length > 0) {
        variantData = food.variants.find(
          (v) => v._id.toString() === item.variantId?.toString()
        );
      }

      return {
        foodId: {
          _id: food._id,
          title: food.title,
          image: food.image,
        },
        quantity: item.quantity,
        price: item.price,
        finalPrice: item.finalPrice,
        variantId: item.variantId,
        variant: variantData
          ? { label: variantData.label, subprice: variantData.subprice }
          : null,
      };
    });

    return {
      ...order._doc,
      foods,
    };
  });

  res.status(200).json({
    message: "Orders fetched successfully",
    count: result.length,
    orders: result,
  });
});

export const getStatusOrder = asyncHandeler(async (req, res, next) => {
  const { id } = req.params;

  const order = await orderModel.findById(id);

  if (!order) return next(new AppError("Order not found"));

  res.status(200).json({ status: order.status });
});

export const webkook = async (req, res, next) => {
  const stripe = new Stripe(process.env.stripe_secret);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const { orderId } = event.data.object.metadata;

  if (event.type !== "checkout.session.completed") {
    await orderModel.findOneAndUpdate({ _id: orderId }, { status: "rejected" });
    return res.status(400).json("fail");
  }

  await orderModel.findOneAndUpdate({ _id: orderId }, { status: "placed" });
  return res.status(200).json("done");
};