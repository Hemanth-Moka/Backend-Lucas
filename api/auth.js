const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email=$1 OR username=$2",
      [email, username]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (email, username, password) VALUES ($1, $2, $3)",
      [email, username, hashedPassword]
    );

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
