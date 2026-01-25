const express = require("express");
const pool = require("../db");
const router = express.Router();

/* GET wishlist */
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  const result = await pool.query(
    "SELECT product_data FROM wishlist WHERE user_id=$1",
    [userId]
  );

  res.json(result.rows.map(r => r.product_data));
});

/* ADD to wishlist */
router.post("/", async (req, res) => {
  const { userId, product } = req.body;

  await pool.query(
    `INSERT INTO wishlist (user_id, product_id, product_data)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [userId, product.id, product]
  );

  res.json({ message: "Added to wishlist" });
});

/* REMOVE from wishlist */
router.delete("/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;

  await pool.query(
    "DELETE FROM wishlist WHERE user_id=$1 AND product_id=$2",
    [userId, productId]
  );

  res.json({ message: "Removed" });
});

module.exports = router;
