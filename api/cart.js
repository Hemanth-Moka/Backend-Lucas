const express = require("express");
const pool = require("../db");
const router = express.Router();

/* GET cart */
router.get("/:userId", async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ADD to cart */
router.post("/", async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
