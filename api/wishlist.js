const express = require("express");
const pool = require("../db");
const router = express.Router();

/* GET wishlist */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      "SELECT product_data FROM wishlist WHERE user_id=$1",
      [userId]
    );

    res.json(result.rows.map(r => r.product_data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ADD to wishlist */
router.post("/", async (req, res) => {
  try {
    const { userId, product } = req.body;

    await pool.query(
      `INSERT INTO wishlist (user_id, product_id, product_data)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [userId, product.id, product]
    );

    res.json({ message: "Added to wishlist" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* REMOVE from wishlist */
router.delete("/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    await pool.query(
      "DELETE FROM wishlist WHERE user_id=$1 AND product_id=$2",
      [userId, productId]
    );

    res.json({ message: "Removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
