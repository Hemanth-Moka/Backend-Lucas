const express = require("express");
const router = express.Router();
const pool = require("../db");

/* CREATE ORDER */
router.post("/", async (req, res) => {
  const o = req.body;

  try {
    await pool.query("BEGIN");

    await pool.query(
      `INSERT INTO orders
      (order_id,email,first_name,last_name,address,city,country,zip_code,phone,
       payment_method,subtotal,shipping,tax,total,order_date,delivery_date,status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [
        o.orderId,
        o.shippingAddress.email,
        o.shippingAddress.firstName,
        o.shippingAddress.lastName,
        o.shippingAddress.address,
        o.shippingAddress.city,
        o.shippingAddress.country,
        o.shippingAddress.zipCode,
        o.shippingAddress.phone,
        o.paymentMethod,
        o.subtotal,
        o.shipping,
        o.tax,
        o.total,
        o.orderDate,
        o.deliveryDate,
        o.status,
      ]
    );

    for (const item of o.items) {
      await pool.query(
        `INSERT INTO order_items
         (order_id,product_id,name,price,quantity,selected_size)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          o.orderId,
          item.id,
          item.name,
          item.price,
          item.quantity,
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

/* GET ORDERS */
router.get("/", async (req, res) => {
  try {
    const ordersRes = await pool.query(
      "SELECT * FROM orders ORDER BY id DESC"
    );

    const result = [];

    for (const o of ordersRes.rows) {
      const items = await pool.query(
        "SELECT * FROM order_items WHERE order_id=$1",
        [o.order_id]
      );

      result.push({
        ...o,
        items: items.rows,
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).send("Error fetching orders");
  }
});

module.exports = router;
