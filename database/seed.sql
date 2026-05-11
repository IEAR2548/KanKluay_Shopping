-- ============================================================
--  KanKluay Seed Data (for demo)
-- ============================================================

-- Users (role: 'user' | 'admin', status: 'active' | 'inactive' | 'suspended')
INSERT INTO "User" (firstname, lastname, username, email, password, phone_number, image_url, role, status) VALUES
('แอดมิน',  'ระบบ',    'admin',    'admin@kankluay.com', 'hashed_pw_0', '0800000000', null,                                                          'admin', 'active'),
('สมชาย',   'ใจดี',    'somchai',  'somchai@email.com',  'hashed_pw_1', '0812345678', 'https://api.dicebear.com/7.x/avataaars/svg?seed=somchai',      'user',  'active'),
('สมหญิง',  'รักดี',   'somying',  'somying@email.com',  'hashed_pw_2', '0823456789', 'https://api.dicebear.com/7.x/avataaars/svg?seed=somying',      'user',  'active'),
('กานต์',   'มีสุข',   'kaan',     'kaan@email.com',     'hashed_pw_3', '0834567890', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kaan',         'user',  'active'),
('นิด',     'น้อย',    'nid',      'nid@email.com',      'hashed_pw_4', '0845678901', 'https://api.dicebear.com/7.x/avataaars/svg?seed=nid',          'user',  'inactive'),
('แบน',     'ทดสอบ',   'banned01', 'banned@email.com',   'hashed_pw_5', '0856789012', null,                                                          'user',  'suspended');

-- User Addresses
INSERT INTO User_Address (user_id, recipient_name, phone_number, address_detail, is_default) VALUES
(2, 'สมชาย ใจดี',   '0812345678', '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพ 10110',   TRUE),
(2, 'สมชาย ใจดี',   '0812345678', '456 ถนนลาดพร้าว แขวงลาดพร้าว เขตลาดพร้าว กรุงเทพ 10230', FALSE),
(3, 'สมหญิง รักดี', '0823456789', '789 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพ 10310',  TRUE);

-- Shops
INSERT INTO Shop (user_id, shop_name, shop_description, logo_url, status) VALUES
(4, 'ร้านกานต์ช็อป', 'ขายของใช้ในบ้านคุณภาพดี', null, 'active'),
(5, 'นิดช็อปปิ้ง',   'แฟชั่นสุดเก๋ราคาถูก',     null, 'inactive');

-- Global Categories
INSERT INTO Global_Category (category_name, image_url) VALUES
('อิเล็กทรอนิกส์',       'https://img.icons8.com/color/96/electronics.png'),
('เสื้อผ้าและแฟชั่น',    'https://img.icons8.com/color/96/clothes.png'),
('ของใช้ในบ้าน',          'https://img.icons8.com/color/96/home.png'),
('อาหารและเครื่องดื่ม',  'https://img.icons8.com/color/96/food.png');

-- Local Categories
INSERT INTO Local_Category (shop_id, global_cat_id, category_name, image_url) VALUES
(1, 3, 'เครื่องใช้ไฟฟ้า', null),
(1, 3, 'เฟอร์นิเจอร์',    null),
(2, 2, 'เสื้อผ้าผู้หญิง', null),
(2, 2, 'กระเป๋า',          null);

-- Products
INSERT INTO Product (shop_id, local_cat_id, product_name, description, price, image_url) VALUES
(1, 1, 'พัดลมตั้งโต๊ะ Panasonic',  'พัดลมประหยัดไฟ 3 ความเร็ว',          890.00,  null),
(1, 1, 'หม้อหุงข้าว Toshiba 1.8L', 'หม้อหุงข้าวดิจิตอล ความจุ 1.8 ลิตร', 1590.00, null),
(1, 2, 'โต๊ะทำงาน',                'โต๊ะไม้ MDF ขนาด 120x60 ซม.',         2200.00, null),
(2, 3, 'เสื้อยืด Oversize',         'ผ้า Cotton 100% มีหลายสี',             350.00,  null),
(2, 3, 'กางเกงขายาว',              'ผ้า Linen เนื้อนุ่ม',                  590.00,  null),
(2, 4, 'กระเป๋าสะพายข้าง',         'หนัง PU คุณภาพดี',                     1200.00, null);

-- Inventory (product 5 = low stock, product 6 = out of stock สำหรับ demo)
INSERT INTO Inventory (product_id, quantity) VALUES
(1, 50),
(2, 30),
(3, 15),
(4, 100),
(5, 3),
(6, 0);

-- Orders
-- order_status:    'pending' | 'completed' | 'cancelled'
-- shipping_status: 'shipping' | 'delivered' | 'returned'
INSERT INTO "Order" (user_id, shop_id, address_id, total_amount, net_amount, platform_fee, payment_method, payment_timestamp, shipping_status, order_status) VALUES
(2, 1, 1, 890.00,  836.60,  53.40,  'credit_card', NOW() - INTERVAL '5 days', 'delivered', 'completed'),
(2, 2, 1, 1550.00, 1456.90, 93.00,  'promptpay',   NOW() - INTERVAL '3 days', 'shipping',  'pending'),
(3, 1, 3, 3790.00, 3562.60, 227.40, 'credit_card', NOW() - INTERVAL '1 day',  'shipping',  'pending'),
(2, 1, 1, 500.00,  470.00,  30.00,  'promptpay',   NOW() - INTERVAL '7 days', 'returned',  'cancelled');

-- Order Items
INSERT INTO Order_Item (order_id, product_id, quantity, price_at_purchase) VALUES
(1, 1, 1, 890.00),
(2, 4, 2, 350.00),
(2, 6, 1, 1200.00),
(3, 2, 1, 1590.00),
(3, 3, 1, 2200.00),
(4, 4, 1, 350.00);

-- Shop Payouts
INSERT INTO Shop_Payout (shop_id, order_id, payout_date, net_amount, status) VALUES
(1, 1, NOW() - INTERVAL '2 days', 836.60,  'completed'),
(2, 2, NOW(),                     1456.90, 'pending'),
(1, 3, NOW(),                     3562.60, 'pending');