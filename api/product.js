const express = require("express");
const pool = require("../db");

const router = express.Router();

// helper to convert DB → frontend format
const mapProduct = (p) => ({
  id: p.id,
  name: p.name,
  brand: p.brand,
  price: p.price,
  originalPrice: p.original_price,
  description: p.description,
  category: p.category,
  gender: p.gender,
  sizes: p.sizes,
  inStock: p.in_stock,
  bestSeller: p.best_seller,
  newArrival: p.new_arrival,
  image: p.image,
});

// 🔹 Add Product
router.post("/", async (req, res) => {
  try {
    const {
      name,
      brand,
      price,
      originalPrice,
      description,
      category,
      gender,
      sizes,
      inStock,
      bestSeller,
      newArrival,
      image,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO products
      (name, brand, price, original_price, description, category, gender, sizes, in_stock, best_seller, new_arrival, image)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        name,
        brand,
        price,
        originalPrice,
        description,
        category,
        gender,
        sizes,
        inStock,
        bestSeller,
        newArrival,
        image,
      ]
    );

    res.json(mapProduct(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Get All Products
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY id DESC"
    );
    res.json(result.rows.map(mapProduct));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Delete Product
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id=$1", [req.params.id]);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Update Product
router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      brand,
      price,
      originalPrice,
      description,
      category,
      gender,
      sizes,
      inStock,
      bestSeller,
      newArrival,
      image,
    } = req.body;

    const result = await pool.query(
      `UPDATE products SET
      name=$1,
      brand=$2,
      price=$3,
      original_price=$4,
      description=$5,
      category=$6,
      gender=$7,
      sizes=$8,
      in_stock=$9,
      best_seller=$10,
      new_arrival=$11,
      image=$12
      WHERE id=$13
      RETURNING *`,
      [
        name,
        brand,
        price,
        originalPrice,
        description,
        category,
        gender,
        sizes,
        inStock,
        bestSeller,
        newArrival,
        image,
        req.params.id,
      ]
    );

    res.json(mapProduct(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
