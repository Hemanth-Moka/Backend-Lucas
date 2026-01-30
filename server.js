const express = require("express");
const cors = require("cors");

const authRoutes = require("./api/auth");
const wishlistRoutes = require("./api/wishlist");
const cartRoutes = require("./api/cart");
const orderRoutes = require("./api/orders");   // ⭐ ADD THIS

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin.startsWith("https://")) return callback(null, true);
      if (origin.startsWith("http://localhost")) return callback(null, true);
      return callback(new Error("CORS blocked"));
    },
    credentials: true,
  })
);

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);   // ⭐ ADD THIS

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
