const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000", // URL ของ Next.js
    credentials: true, // ← จำเป็น! เพื่อให้ cookie ส่งได้
  }),
);

// Routes — แต่ละคนมาเพิ่ม import ของตัวเองตรงนี้
// middleware
const authRoutes = require("./routes/authRoutes");

const shopRoutes = require("./routes/shopRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const reportRoutes = require("./routes/reportRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Middleware
app.use("/auth", authRoutes);
app.use("/shops", shopRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/cart", cartRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/reports", reportRoutes);
app.use("/dashboard", dashboardRoutes);

app.use("/users", userRoutes);
app.use("/orders", orderRoutes);

app.use("/uploads", express.static("public/uploads")); // serve รูป
app.use("/upload", uploadRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler (ต้องอยู่บรรทัดสุดท้าย)
app.use(require("./middleware/errorHandler"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
