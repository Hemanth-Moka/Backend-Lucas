const express = require("express");
const pool = require("../db");
const router = express.Router();

/* GET cart */
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  const cart = await pool.query(
    "SELECT id FROM cart WHERE user_id=$1",
    [userId]
  );

  if (cart.rows.length === 0) return res.json([]);

  const items = await pool.query(
    "SELECT * FROM cart_items WHERE cart_id=$1",
    [cart.rows[0].id]
  );

  res.json(items.rows);
});

/* ADD to cart */
router.post("/", async (req, res) => {
  const { userId, product, size } = req.body;

  let cart = await pool.query(
    "SELECT id FROM cart WHERE user_id=$1",
    [userId]
  );

  if (cart.rows.length === 0) {
    cart = await pool.query(
      "INSERT INTO cart (user_id) VALUES ($1) RETURNING id",
      [userId]
    );
  }

  await pool.query(
    `INSERT INTO cart_items (cart_id, product_id, product_data, selected_size)
     VALUES ($1, $2, $3, $4)`,
    [cart.rows[0].id, product.id, product, size]
  );

  res.json({ message: "Added to cart" });
});

module.exports = router;
