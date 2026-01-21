// const express = require("express");
// const cors = require("cors");

// const authRoutes = require("./api/auth");

// const app = express();

// app.use(cors({ origin: "http://localhost:3000", credentials: true }));
// app.use(express.json());

// app.use("/api/auth", authRoutes);

// app.listen(8080, () => {
//   console.log("Server running on http://localhost:8080");
// });


const express = require("express");
const cors = require("cors");

const authRoutes = require("./api/auth");

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

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// const express = require("express");
// const cors = require("cors");

// const authRoutes = require("./api/auth");

// const app = express();

// app.use(express.json());

// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000",
//       "http://localhost:5173",
//       "https://lucaas-website.vercel.app",
//     ],
//     credentials: true,
//   })
// );

// app.use("/api/auth", authRoutes);

// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
