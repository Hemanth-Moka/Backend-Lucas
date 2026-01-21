const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});
    