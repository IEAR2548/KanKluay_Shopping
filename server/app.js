const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app     = express();

app.use(cors());
app.use(express.json());

// Routes — แต่ละคนมาเพิ่ม import ของตัวเองตรงนี้
const shopRoutes       = require('./routes/shopRoutes');
const productRoutes    = require('./routes/productRoutes');
const categoryRoutes   = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');


app.use('/shops',      shopRoutes);
app.use('/products',   productRoutes);
app.use('/categories', categoryRoutes);
app.use('/cart', cartRoutes);
app.use('/inventory', inventoryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (ต้องอยู่บรรทัดสุดท้าย)
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
