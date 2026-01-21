const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");

const router = express.Router();

/* =========================
   REGISTER
========================= */
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await pool.query(
      "SELECT id FROM users WHERE email=$1 OR username=$2",
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

    return res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   LOGIN (username OR email)
========================= */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body; // username can be email OR username

    if (!username || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    // Find user by username OR email
    const result = await pool.query(
      "SELECT id, username, email, password, role FROM users WHERE username=$1 OR email=$1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Success
    return res.status(200).json({
      message: "Login successful",
      role: user.role,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
