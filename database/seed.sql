-- ============================================================
--  KanKluay Seed Data (for demo)
-- ============================================================

-- Users
INSERT INTO "User" (firstname, lastname, username, email, password, phone_number, role) VALUES
('สมชาย', 'ใจดี',    'somchai',  'somchai@email.com',  'hashed_pw_1', '0812345678', 'customer'),
('สมหญิง', 'รักดี',   'somying',  'somying@email.com',  'hashed_pw_2', '0823456789', 'customer'),
('กานต์',  'มีสุข',   'kaan',     'kaan@email.com',     'hashed_pw_3', '0834567890', 'seller'),
('นิด',    'น้อย',    'nid',      'nid@email.com',      'hashed_pw_4', '0845678901', 'seller');

-- User Addresses
INSERT INTO User_Address (user_id, recipient_name, phone_number, address_detail, is_default) VALUES
(1, 'สมชาย ใจดี',  '0812345678', '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพ 10110', TRUE),
(1, 'สมชาย ใจดี',  '0812345678', '456 ถนนลาดพร้าว แขวงลาดพร้าว เขตลาดพร้าว กรุงเทพ 10230', FALSE),
(2, 'สมหญิง รักดี', '0823456789', '789 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพ 10310', TRUE);

-- Shops
INSERT INTO Shop (user_id, shop_name, shop_description) VALUES
(3, 'ร้านกานต์ช็อป',    'ขายของใช้ในบ้านคุณภาพดี'),
(4, 'นิดช็อปปิ้ง',      'แฟชั่นสุดเก๋ราคาถูก');

-- Global Categories
INSERT INTO Global_Category (category_name) VALUES
('อิเล็กทรอนิกส์'),
('เสื้อผ้าและแฟชั่น'),
('ของใช้ในบ้าน'),
('อาหารและเครื่องดื่ม');

-- Local Categories
INSERT INTO Local_Category (shop_id, global_cat_id, category_name) VALUES
(1, 3, 'เครื่องใช้ไฟฟ้า'),
(1, 3, 'เฟอร์นิเจอร์'),
(2, 2, 'เสื้อผ้าผู้หญิง'),
(2, 2, 'กระเป๋า');

-- Products
INSERT INTO Product (shop_id, local_cat_id, product_name, description, price) VALUES
(1, 1, 'พัดลมตั้งโต๊ะ Panasonic',  'พัดลมประหยัดไฟ 3 ความเร็ว',          890.00),
(1, 1, 'หม้อหุงข้าว Toshiba 1.8L', 'หม้อหุงข้าวดิจิตอล ความจุ 1.8 ลิตร', 1590.00),
(1, 2, 'โต๊ะทำงาน',                'โต๊ะไม้ MDF ขนาด 120x60 ซม.',         2200.00),
(2, 3, 'เสื้อยืด Oversize',         'ผ้า Cotton 100% มีหลายสี',             350.00),
(2, 3, 'กางเกงขายาว',              'ผ้า Linen เนื้อนุ่ม',                  590.00),
(2, 4, 'กระเป๋าสะพายข้าง',         'หนัง PU คุณภาพดี',                     1200.00);

-- Inventory
INSERT INTO Inventory (product_id, quantity) VALUES
(1, 50),
(2, 30),
(3, 15),
(4, 100),
(5, 80),
(6, 25);

-- Orders
INSERT INTO "Order" (user_id, shop_id, address_id, total_amount, net_amount, platform_fee, payment_method, payment_timestamp, shipping_status, order_status) VALUES
(1, 1, 1, 890.00,  836.60,  53.40,  'credit_card', NOW() - INTERVAL '5 days', 'delivered', 'completed'),
(1, 2, 1, 1550.00, 1456.90, 93.00,  'promptpay',   NOW() - INTERVAL '3 days', 'shipping',  'confirmed'),
(2, 1, 3, 3790.00, 3562.60, 227.40, 'credit_card', NOW() - INTERVAL '1 day',  'pending',   'confirmed');

-- Order Items
INSERT INTO Order_Item (order_id, product_id, quantity, price_at_purchase) VALUES
(1, 1, 1, 890.00),
(2, 4, 2, 350.00),
(2, 6, 1, 1200.00),
(3, 2, 1, 1590.00),
(3, 3, 1, 2200.00);

-- Shop Payouts
INSERT INTO Shop_Payout (shop_id, order_id, payout_date, net_amount, status) VALUES
(1, 1, NOW() - INTERVAL '2 days', 836.60,  'completed'),
(2, 2, NOW(),                     1456.90, 'pending'),
(1, 3, NOW(),                     3562.60, 'pending');