// const express = require("express");
// const router = express.Router();
// const pool = require("../db");

// /* ================= CREATE ORDER ================= */
// router.post("/", async (req, res) => {
//   const o = req.body;

//   try {
//     await pool.query("BEGIN");

//     // extra safety for email
//     const email = o.userEmail?.trim() || null;

//     await pool.query(
//       `INSERT INTO orders
//       (order_id,email,first_name,last_name,address,city,country,zip_code,phone,
//        payment_method,subtotal,shipping,tax,total,order_date,delivery_date,status)
//       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
//       [
//         o.orderId,
//         email,
//         o.shippingAddress?.firstName,
//         o.shippingAddress?.lastName,
//         o.shippingAddress?.address,
//         o.shippingAddress?.city,
//         o.shippingAddress?.country,
//         o.shippingAddress?.zipCode,
//         o.shippingAddress?.phone,
//         o.paymentMethod,
//         Number(o.subtotal),
//         Number(o.shipping),
//         Number(o.tax),
//         Number(o.total),
//         o.orderDate,
//         o.deliveryDate,
//         o.status,
//       ]
//     );

//     for (const item of o.items || []) {
//       await pool.query(
//         `INSERT INTO order_items
//          (order_id,product_id,name,price,quantity,selected_size)
//          VALUES ($1,$2,$3,$4,$5,$6)`,
//         [
//           o.orderId,
//           item.id,
//           item.name,
//           Number(item.price),
//           Number(item.quantity),
//           item.selectedSize || null,
//         ]
//       );
//     }

//     await pool.query("COMMIT");
//     res.json({ success: true });
//   } catch (err) {
//     await pool.query("ROLLBACK");
//     console.error(err);
//     res.status(500).send("Order Failed");
//   }
// });

// /* ================= GET ORDERS – ONLY MY ORDERS ================= */
// router.get("/", async (req, res) => {
//   try {
//     const email = req.query.email?.trim();

//     // if no email → no orders
//     if (!email) {
//       return res.json([]);
//     }

//     const ordersRes = await pool.query(
//       "SELECT * FROM orders WHERE email=$1 ORDER BY id DESC",
//       [email]
//     );

//     const result = [];

//     for (const o of ordersRes.rows) {
//       const itemsRes = await pool.query(
//         "SELECT * FROM order_items WHERE order_id=$1",
//         [o.order_id]
//       );

//       const items = itemsRes.rows.map((i) => ({
//         id: i.product_id,
//         name: i.name,
//         price: Number(i.price),
//         quantity: Number(i.quantity),
//         selectedSize: i.selected_size,
//       }));

//       result.push({
//         orderId: o.order_id,
//         orderDate: o.order_date,
//         deliveryDate: o.delivery_date,
//         status: o.status,
//         paymentMethod: o.payment_method,

//         subtotal: Number(o.subtotal),
//         shipping: Number(o.shipping),
//         tax: Number(o.tax),
//         total: Number(o.total),

//         shippingAddress: {
//           email: o.email,
//           firstName: o.first_name,
//           lastName: o.last_name,
//           address: o.address,
//           city: o.city,
//           country: o.country,
//           zipCode: o.zip_code,
//           phone: o.phone,
//         },

//         items,
//       });
//     }

//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error fetching orders");
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const pool = require("../db");

/* ================= CREATE ORDER ================= */
router.post("/", async (req, res) => {
  const o = req.body;

  try {
    await pool.query("BEGIN");

    const email = o.userEmail?.trim();
    if (!email) {
      return res.status(400).json({ message: "User email required" });
    }

    await pool.query(
      `INSERT INTO orders
      (order_id,email,first_name,last_name,address,city,country,zip_code,phone,
       payment_method,subtotal,shipping,tax,total,order_date,delivery_date,status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [
        o.orderId,
        email,
        o.shippingAddress?.firstName,
        o.shippingAddress?.lastName,
        o.shippingAddress?.address,
        o.shippingAddress?.city,
        o.shippingAddress?.country,
        o.shippingAddress?.zipCode,
        o.shippingAddress?.phone,
        o.paymentMethod,
        Number(o.subtotal),
        Number(o.shipping),
        Number(o.tax),
        Number(o.total),
        o.orderDate,
        o.deliveryDate,
        o.status,
      ]
    );

    for (const item of o.items || []) {
      await pool.query(
        `INSERT INTO order_items
         (order_id,product_id,name,price,quantity,selected_size)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          o.orderId,
          item.id,
          item.name,
          Number(item.price),
          Number(item.quantity),
          item.selectedSize || null,
        ]
      );
    }

    await pool.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);
    res.status(500).send("Order Failed");
  }
});

/* ================= GET MY ORDERS (USER) ================= */
router.get("/", async (req, res) => {
  try {
    const email = req.query.email?.trim();
    if (!email) return res.json([]);

    const ordersRes = await pool.query(
      "SELECT * FROM orders WHERE email=$1 ORDER BY id DESC",
      [email]
    );

    const result = [];

    for (const o of ordersRes.rows) {
      const itemsRes = await pool.query(
        "SELECT * FROM order_items WHERE order_id=$1",
        [o.order_id]
      );

      result.push({
        orderId: o.order_id,
        orderDate: o.order_date,
        deliveryDate: o.delivery_date,
        status: o.status,
        paymentMethod: o.payment_method,
        subtotal: Number(o.subtotal),
        shipping: Number(o.shipping),
        tax: Number(o.tax),
        total: Number(o.total),

        shippingAddress: {
          email: o.email,
          firstName: o.first_name,
          lastName: o.last_name,
          address: o.address,
          city: o.city,
          country: o.country,
          zipCode: o.zip_code,
          phone: o.phone,
        },

        items: itemsRes.rows,
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching orders");
  }
});

/* ================= ADMIN – ALL ORDERS ================= */
router.get("/admin", async (req, res) => {
  try {
    const ordersRes = await pool.query(
      "SELECT * FROM orders ORDER BY id DESC"
    );

    const result = [];

    for (const o of ordersRes.rows) {
      const itemsRes = await pool.query(
        "SELECT * FROM order_items WHERE order_id=$1",
        [o.order_id]
      );

      result.push({
        orderId: o.order_id,
        email: o.email,
        firstName: o.first_name,
        lastName: o.last_name,
        address: o.address,
        city: o.city,
        country: o.country,
        zipCode: o.zip_code,
        phone: o.phone,
        paymentMethod: o.payment_method,
        subtotal: Number(o.subtotal),
        shipping: Number(o.shipping),
        tax: Number(o.tax),
        total: Number(o.total),
        status: o.status,
        orderDate: o.order_date,
        deliveryDate: o.delivery_date,
        items: itemsRes.rows,
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Admin fetch failed");
  }
});

module.exports = router;