// const express = require("express");
// const cors = require("cors");

// const authRoutes = require("./api/auth");
// const wishlistRoutes = require("./api/wishlist");
// const cartRoutes = require("./api/cart");
// const orderRoutes = require("./api/orders");   // ⭐ ADD THIS
// const upload = require("./upload");          // Cloudinary multer
// const productRoutes = require("./api/product"); // products API


// const app = express();

// app.use(express.json());

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       if (origin.startsWith("https://")) return callback(null, true);
//       if (origin.startsWith("http://localhost")) return callback(null, true);
//       return callback(new Error("CORS blocked"));
//     },
//     credentials: true,
//   })
// );


// // 🔹 Cloudinary image upload
// app.post("/upload", upload.single("image"), (req, res) => {
//   res.json({
//     imageUrl: req.file.path,
//   });
// });


// /* ROUTES */
// app.use("/api/auth", authRoutes);
// app.use("/api/wishlist", wishlistRoutes);
// app.use("/api/cart", cartRoutes);
// app.use("/api/orders", orderRoutes);   // ⭐ ADD THIS

// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });


const express = require("express");
const cors = require("cors");
const fs = require("fs");

const authRoutes = require("./api/auth");
const wishlistRoutes = require("./api/wishlist");
const cartRoutes = require("./api/cart");
const orderRoutes = require("./api/orders");
const productRoutes = require("./api/product");

const upload = require("./upload");        // multer temp storage
const cloudinary = require("./cloudinary"); // cloudinary config

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

//
// ✅ REAL Cloudinary Upload Route
//
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "products",
    });

    // delete temp file after upload
    fs.unlinkSync(req.file.path);

    res.json({
      imageUrl: result.secure_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
