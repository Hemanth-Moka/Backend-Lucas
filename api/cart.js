const express = require("express");
const pool = require("../db");
const router = express.Router();

/* =========================
   GET CART
========================= */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const cartRes = await pool.query(
      "SELECT id FROM cart WHERE user_id=$1",
      [userId]
    );

    if (cartRes.rows.length === 0) {
      return res.json([]);
    }

    const items = await pool.query(
      `SELECT 
         id,
         product_id,
         product_data,
         selected_size,
         quantity
       FROM cart_items
       WHERE cart_id=$1`,
      [cartRes.rows[0].id]
    );

    res.json(items.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   ADD TO CART (or increase qty)
========================= */
router.post("/", async (req, res) => {
  try {
    const { userId, product, size } = req.body;

    // find or create cart
    let cartRes = await pool.query(
      "SELECT id FROM cart WHERE user_id=$1",
      [userId]
    );

    if (cartRes.rows.length === 0) {
      cartRes = await pool.query(
        "INSERT INTO cart (user_id) VALUES ($1) RETURNING id",
        [userId]
      );
    }

    const cartId = cartRes.rows[0].id;

    // check if item already exists
    const existing = await pool.query(
      `SELECT id, quantity 
       FROM cart_items 
       WHERE cart_id=$1 AND product_id=$2 AND selected_size=$3`,
      [cartId, product.id, size]
    );

    if (existing.rows.length > 0) {
      // increase quantity
      await pool.query(
        `UPDATE cart_items
         SET quantity = quantity + 1
         WHERE id=$1`,
        [existing.rows[0].id]
      );
    } else {
      // insert new item
      await pool.query(
        `INSERT INTO cart_items 
         (cart_id, product_id, product_data, selected_size, quantity)
         VALUES ($1, $2, $3, $4, 1)`,
        [cartId, product.id, product, size]
      );
    }

    res.json({ message: "Added to cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   UPDATE QUANTITY
========================= */
router.put("/", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    await pool.query(
      `UPDATE cart_items
       SET quantity=$1
       WHERE product_id=$2
       AND cart_id=(SELECT id FROM cart WHERE user_id=$3)`,
      [quantity, productId, userId]
    );

    res.json({ message: "Quantity updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   REMOVE FROM CART
========================= */
router.delete("/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    await pool.query(
      `DELETE FROM cart_items
       WHERE product_id=$1
       AND cart_id=(SELECT id FROM cart WHERE user_id=$2)`,
      [productId, userId]
    );

    res.json({ message: "Removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
