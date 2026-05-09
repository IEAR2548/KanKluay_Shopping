# 🍌 KanKluay — E-Commerce Platform

ระบบ e-commerce สำหรับ Term Project วิชา CPE241 Database Systems

---

## 🚀 วิธีรันโปรเจ็ค

### สิ่งที่ต้องติดตั้งก่อน
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### ขั้นตอน

```bash
# 1. Clone repo
git clone https://github.com/<your-org>/kankluay.git
cd kankluay

# 2. สร้างไฟล์ .env จาก .env.example
cp .env.example .env

# 3. รัน Docker
docker compose up --build

# 4. เปิดเบราว์เซอร์
# Frontend → http://localhost:3000
# Backend  → http://localhost:5000
```

### หยุดรัน

```bash
docker compose down
```

### ล้างฐานข้อมูลแล้วเริ่มใหม่

```bash
docker compose down -v
docker compose up --build
```

---

## 📁 โครงสร้างไฟล์

```
kankluay/
│
├── client/                          # Frontend — Next.js
│   ├── app/                         # App Router ของ Next.js
│   │   ├── products/                # หน้า CRUD สินค้า
│   │   ├── orders/                  # หน้า CRUD คำสั่งซื้อ
│   │   ├── reports/                 # หน้า Reports และ Dashboard
│   │   └── layout.tsx               # Layout หลักของทั้งแอป (Navbar ฯลฯ)
│   ├── components/
│   │   ├── ui/                      # Component ที่ใช้ซ้ำได้ เช่น Button, Table, Modal
│   │   └── layout/                  # Navbar, Sidebar
│   └── lib/
│       └── api/                     # Functions สำหรับเรียก API ไปที่ server
│           ├── products.ts          # fetchProducts(), createProduct() ฯลฯ
│           ├── orders.ts            # fetchOrders(), createOrder() ฯลฯ
│           └── reports.ts           # fetchReports() ฯลฯ
│
├── server/                          # Backend — Node.js + Express
│   ├── app.js                       # Entry point ของ Express, ตั้งค่า middleware ทั้งหมด
│   ├── controllers/                 # จัดการ request/response logic
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── shopController.js
│   │   └── reportController.js
│   ├── routes/                      # กำหนด API endpoint เช่น GET /products
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── shopRoutes.js
│   │   └── reportRoutes.js
│   ├── services/                    # Business logic และ query ฐานข้อมูล
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   ├── shopService.js
│   │   └── reportService.js
│   └── middleware/
│       └── errorHandler.js          # จัดการ error กลาง ไม่ต้อง try/catch ทุกที่
│
├── database/
│   ├── schema.sql                   # สร้างตารางทั้งหมด (รันอัตโนมัติตอน docker up)
│   └── seed.sql                     # ข้อมูลตัวอย่างสำหรับ demo (รันอัตโนมัติตอน docker up)
│
├── docker-compose.yml               # ตั้งค่า service db + server + client
├── .env.example                     # ตัวอย่าง environment variables (copy ไปเป็น .env)
└── README.md                        # ไฟล์นี้
```

---

## 🌿 Git Branch

| Branch | เจ้าของ | งาน |
|--------|--------|-----|
| `main` | ทุกคน | โครงหลัก, schema, seed |
| `feat/shop-product` | คน 1 | Shop, Product, Category CRUD |
| `feat/user-order` | คน 2 | User, Order, Order_Item CRUD |
| `feat/cart-inventory` | คน 3 | Cart, Inventory management |
| `feat/reports-payout` | คน 4 | Reports, Dashboard, Shop_Payout |

### Flow การทำงาน

```bash
# ดึง branch ล่าสุดจาก main
git checkout main
git pull origin main

# สร้าง branch ของตัวเอง
git checkout -b feat/your-feature

# เมื่อเสร็จแล้ว push และเปิด Pull Request
git push origin feat/your-feature
```

---

## 🔌 API Endpoints

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/products` | ดูสินค้าทั้งหมด |
| POST | `/products` | เพิ่มสินค้า |
| PUT | `/products/:id` | แก้ไขสินค้า |
| DELETE | `/products/:id` | ลบสินค้า |
| GET | `/orders` | ดูคำสั่งซื้อทั้งหมด |
| POST | `/orders` | สร้างคำสั่งซื้อ |
| GET | `/reports/top-products` | สินค้าขายดีแต่ละ category |
| GET | `/reports/shop-revenue` | ยอดขายต่อร้าน |
| GET | `/reports/payout` | สรุป Payout |