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

-- ============================================================
--  Massive Seed Data: Users, Shops, Products, and Orders (2026)
-- ============================================================

-- 1. เพิ่มผู้ใช้งานใหม่ (Users 7 - 15)
INSERT INTO "User" (firstname, lastname, username, email, password, phone_number, image_url, role, status) VALUES
('ธนพล',  'เจริญทรัพย์', 'thanapon',  'thanapon@email.com',  'hashed_pw_7',  '0861112222', 'https://api.dicebear.com/7.x/avataaars/svg?seed=thanapon',  'user', 'active'),
('มาริสา', 'วรโชติ',    'marisa',    'marisa@email.com',    'hashed_pw_8',  '0872223333', 'https://api.dicebear.com/7.x/avataaars/svg?seed=marisa',    'user', 'active'),
('ณัฐวุฒิ', 'ศิริปัญญา',   'nattawut',  'nattawut@email.com',  'hashed_pw_9',  '0883334444', 'https://api.dicebear.com/7.x/avataaars/svg?seed=nattawut',  'user', 'active'),
('พิมพ์ชนก','แสนสุข',    'pimchanok', 'pimchanok@email.com', 'hashed_pw_10', '0894445555', 'https://api.dicebear.com/7.x/avataaars/svg?seed=pimchanok', 'user', 'active'),
('วายุ',   'สายลม',     'wayu_wind', 'wayu@email.com',      'hashed_pw_11', '0815556666', 'https://api.dicebear.com/7.x/avataaars/svg?seed=wayu',      'user', 'active'),
('อารยา',  'ใจสว่าง',   'araya',     'araya@email.com',     'hashed_pw_12', '0826667777', null, 'user', 'active'),
('สุรชัย',  'มั่นคง',     'surachai',  'surachai@email.com',  'hashed_pw_13', '0837778888', null, 'user', 'inactive'),
('เกวลิน',  'วิเศษศิลป์',  'kewalin',   'kewalin@email.com',   'hashed_pw_14', '0848889999', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kewalin', 'user', 'active'),
('สแปม',   'บอท',      'spammer99', 'spam@email.com',      'hashed_pw_15', '0859990000', null, 'user', 'suspended');

-- 2. เพิ่มที่อยู่จัดส่งให้ผู้ใช้ใหม่ (Addresses 4 - 10)
INSERT INTO User_Address (user_id, recipient_name, phone_number, address_detail, is_default) VALUES
(7,  'ธนพล เจริญทรัพย์', '0861112222', '99/9 หมู่ 1 ต.ช้างเผือก อ.เมือง จ.เชียงใหม่ 50300', TRUE),
(8,  'มาริสา วรโชติ',    '0872223333', '88 ถนนสีลม แขวงสุริยวงศ์ เขตบางรัก กรุงเทพ 10500', TRUE),
(9,  'ณัฐวุฒิ ศิริปัญญา',   '0883334444', '55/5 ซอยนิมมานเหมินท์ ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200', TRUE),
(10, 'พิมพ์ชนก แสนสุข',   '0894445555', '11 ถนนพัทยากลาง ต.หนองปรือ อ.บางละมุง จ.ชลบุรี 20150', TRUE),
(11, 'วายุ สายลม',     '0815556666', '22 ถนนเพชรเกษม แขวงบางหว้า เขตภาษีเจริญ กรุงเทพ 10160', TRUE),
(11, 'วายุ สายลม (ที่ทำงาน)','0815556666', 'อาคารสาทรสแควร์ ชั้น 15 ถนนสาทรเหนือ กรุงเทพ 10500', FALSE),
(12, 'อารยา ใจสว่าง',   '0826667777', '77/7 ถ.มิตรภาพ ต.ในเมือง อ.เมือง จ.นครราชสีมา 30000', TRUE);

-- 3. เพิ่มร้านค้าใหม่ (Shops 3 - 5)
INSERT INTO Shop (user_id, shop_name, shop_description, logo_url, status) VALUES
(7, 'TechHaven (เทคเฮเว่น)',  'รวมอุปกรณ์ไอทีและแกดเจ็ตสุดล้ำ', null, 'active'),
(8, 'Sport & Fit',          'อุปกรณ์ออกกำลังกายและชุดกีฬา', null, 'active'),
(10, 'Beauty Aura',         'เครื่องสำอางและสกินแคร์แบรนด์แท้', null, 'active');

-- 4. เพิ่ม Global Category ใหม่ (IDs 5, 6)
INSERT INTO Global_Category (category_name, image_url) VALUES
('กีฬาและกิจกรรมกลางแจ้ง', 'https://img.icons8.com/color/96/sports.png'),
('ความงามและของใช้ส่วนตัว', 'https://img.icons8.com/color/96/cosmetics.png');

-- 5. เพิ่ม Local Category สำหรับร้านใหม่ (IDs 5 - 10)
INSERT INTO Local_Category (shop_id, global_cat_id, category_name, image_url) VALUES
(3, 1, 'หูฟังและลำโพง',    null),
(3, 1, 'คีย์บอร์ดและเมาส์', null),
(4, 5, 'ชุดกีฬา',         null),
(4, 5, 'อุปกรณ์ฟิตเนส',    null),
(5, 6, 'สกินแคร์',        null),
(5, 6, 'น้ำหอม',          null);

-- 6. เพิ่มสินค้าใหม่ (Products 7 - 21)
INSERT INTO Product (shop_id, local_cat_id, product_name, description, price, image_url) VALUES
(3, 5, 'หูฟังไร้สาย SoundPro',      'หูฟัง Bluetooth 5.3 ตัดเสียงรบกวน',     1290.00, null),
(3, 5, 'ลำโพงบลูทูธ Mini Bass',    'ลำโพงพกพา กันน้ำ IPX7',              850.00, null),
(3, 6, 'Mechanical Keyboard RK61', 'คีย์บอร์ดเกมมิ่ง 60% สวิตช์ Red',        1550.00, null),
(3, 6, 'เมาส์ไร้สาย Logitech G304', 'เมาส์เกมมิ่งไร้สาย ความแม่นยำสูง',        990.00, null),
(4, 7, 'เสื้อวิ่งระบายอากาศ',         'เสื้อกีฬาสำหรับวิ่ง แห้งไว น้ำหนักเบา',       250.00, null),
(4, 7, 'กางเกงโยคะ',              'ผ้าสแปนเด็กซ์ ยืดหยุ่น 4 ทิศทาง',        390.00, null),
(4, 8, 'เสื่อโยคะ กันลื่น',           'ความหนา 8mm พร้อมสายรัด',            450.00, null),
(4, 8, 'ดัมเบลปรับน้ำหนัก 10kg',     'ดัมเบลหุ้มยาง จับกระชับมือ',             990.00, null),
(5, 9, 'เซรั่มวิตามินซี 30ml',       'ปรับผิวหน้ากระจ่างใส ลดรอยดำ',          690.00, null),
(5, 9, 'ครีมกันแดด SPF50 PA+++', 'กันแดดเนื้อน้ำ บางเบา ไม่เหนอะหนะ',       420.00, null),
(5, 10,'น้ำหอมผู้หญิง Floral Fresh','กลิ่นหอมดอกไม้ ติดทนนาน 8 ชม.',         1450.00, null),
(1, 1, 'ปลั๊กพ่วง 4 ช่อง',           'สายยาว 3 เมตร มาตรฐาน มอก.',         290.00, null),
(2, 3, 'เสื้อเชิ้ตแขนสั้น ทรงเกาหลี',  'ผ้าคอตตอน ใส่สบาย ไม่ร้อน',            450.00, null),
(2, 4, 'กระเป๋าผ้า Tote Bag',      'ผ้าแคนวาส พิมพ์ลายมินิมอล',            199.00, null),
(5, 9, 'แผ่นมาสก์หน้า อโลเวร่า',     'เติมความชุ่มชื้นให้ผิวหน้า (แพ็ค 5 แผ่น)',    150.00, null);

-- 7. เพิ่มสต็อกสินค้า (Inventory สำหรับ Products 7 - 21)
INSERT INTO Inventory (product_id, quantity) VALUES
(7, 20), (8, 45), (9, 15), (10, 30),
(11, 100), (12, 80), (13, 40), (14, 10),
(15, 60), (16, 120), (17, 25), (18, 200),
(19, 50), (20, 150), (21, 300);

-- ============================================================
--  Massive Orders (June - December 2026)
--  Total = Net + Platform Fee (Platform Fee = 6% of Total)
-- ============================================================

-- 8. เพิ่มคำสั่งซื้อรัวๆ 20 รายการ (Orders 13 - 32)
INSERT INTO "Order" (user_id, shop_id, address_id, order_date, total_amount, net_amount, platform_fee, payment_method, payment_timestamp, shipping_status, order_status) VALUES
-- มิถุนายน
(7, 3, 4, '2026-06-05 10:00:00', 1290.00, 1212.60, 77.40,  'credit_card', '2026-06-05 10:05:00', 'delivered', 'completed'),
(8, 4, 5, '2026-06-12 14:30:00', 640.00,  601.60,  38.40,  'promptpay',   '2026-06-12 14:32:00', 'delivered', 'completed'),
(9, 5, 6, '2026-06-25 20:15:00', 1110.00, 1043.40, 66.60,  'credit_card', '2026-06-25 20:15:00', 'delivered', 'completed'),
-- กรกฎาคม
(10, 1, 7, '2026-07-07 09:00:00', 290.00,  272.60,  17.40,  'promptpay',   '2026-07-07 09:10:00', 'delivered', 'completed'),
(11, 3, 8, '2026-07-15 11:45:00', 2540.00, 2387.60, 152.40, 'credit_card', '2026-07-15 11:45:00', 'delivered', 'completed'),
(12, 2, 10,'2026-07-28 16:20:00', 450.00,  423.00,  27.00,  'promptpay',   '2026-07-28 16:25:00', 'delivered', 'completed'),
-- สิงหาคม
(2,  5, 1, '2026-08-08 12:00:00', 1450.00, 1363.00, 87.00,  'credit_card', '2026-08-08 12:02:00', 'delivered', 'completed'),
(3,  4, 3, '2026-08-14 18:30:00', 1440.00, 1353.60, 86.40,  'promptpay',   '2026-08-14 18:35:00', 'delivered', 'completed'),
(7,  3, 4, '2026-08-20 21:10:00', 850.00,  799.00,  51.00,  'credit_card', '2026-08-20 21:10:00', 'returned',  'cancelled'), -- คืนสินค้า
-- กันยายน
(8,  1, 5, '2026-09-09 09:09:00', 1590.00, 1494.60, 95.40,  'promptpay',   '2026-09-09 09:15:00', 'delivered', 'completed'),
(9,  5, 6, '2026-09-18 10:20:00', 840.00,  789.60,  50.40,  'credit_card', '2026-09-18 10:20:00', 'delivered', 'completed'),
(10, 2, 7, '2026-09-25 15:40:00', 199.00,  187.06,  11.94,  'promptpay',   '2026-09-25 15:45:00', 'delivered', 'completed'),
-- ตุลาคม
(11, 4, 9, '2026-10-10 10:10:00', 450.00,  423.00,  27.00,  'credit_card', '2026-10-10 10:10:00', 'delivered', 'completed'),
(12, 3, 10,'2026-10-22 14:00:00', 1550.00, 1457.00, 93.00,  'promptpay',   '2026-10-22 14:05:00', 'delivered', 'completed'),
(7,  5, 4, '2026-10-31 23:50:00', 150.00,  141.00,  9.00,   'credit_card', '2026-10-31 23:55:00', 'delivered', 'completed'),
-- พฤศจิกายน
(8,  2, 5, '2026-11-11 11:11:00', 900.00,  846.00,  54.00,  'promptpay',   '2026-11-11 11:15:00', 'delivered', 'completed'),
(9,  3, 6, '2026-11-20 13:30:00', 990.00,  930.60,  59.40,  'credit_card', '2026-11-20 13:30:00', 'delivered', 'completed'),
(2,  4, 2, '2026-11-28 17:45:00', 1240.00, 1165.60, 74.40,  'promptpay',   '2026-11-28 17:50:00', 'shipping',  'pending'), -- กำลังจัดส่ง
-- ธันวาคม (สิ้นปี)
(3,  1, 3, '2026-12-05 08:20:00', 2200.00, 2068.00, 132.00, 'credit_card', '2026-12-05 08:20:00', 'shipping',  'pending'), -- กำลังจัดส่ง
(10, 5, 7, '2026-12-12 12:12:00', 2140.00, 2011.60, 128.40, 'promptpay',   '2026-12-12 12:15:00', 'shipping',  'pending'); -- กำลังจัดส่ง

-- 9. รายละเอียดสินค้าในแต่ละออเดอร์ (Order Items)
INSERT INTO Order_Item (order_id, product_id, quantity, price_at_purchase) VALUES
(13, 7,  1, 1290.00),                 -- หูฟัง
(14, 11, 1, 250.00), (14, 12, 1, 390.00), -- เสื้อวิ่ง + กางเกงโยคะ
(15, 15, 1, 690.00), (15, 16, 1, 420.00), -- เซรั่ม + กันแดด
(16, 18, 1, 290.00),                 -- ปลั๊กพ่วง
(17, 9,  1, 1550.00), (17, 10, 1, 990.00),-- คีย์บอร์ด + เมาส์
(18, 19, 1, 450.00),                 -- เสื้อเชิ้ต
(19, 17, 1, 1450.00),                -- น้ำหอม
(20, 13, 1, 450.00), (20, 14, 1, 990.00), -- เสื่อโยคะ + ดัมเบล
(21, 8,  1, 850.00),                 -- ลำโพง (ยกเลิก)
(22, 2,  1, 1590.00),                -- หม้อหุงข้าว
(23, 16, 2, 420.00),                 -- กันแดด x2
(24, 20, 1, 199.00),                 -- กระเป๋าผ้า
(25, 13, 1, 450.00),                 -- เสื่อโยคะ
(26, 9,  1, 1550.00),                -- คีย์บอร์ด
(27, 21, 1, 150.00),                 -- มาสก์หน้า
(28, 19, 2, 450.00),                 -- เสื้อเชิ้ต x2
(29, 10, 1, 990.00),                 -- เมาส์
(30, 11, 1, 250.00), (30, 14, 1, 990.00), -- เสื้อวิ่ง + ดัมเบล
(31, 3,  1, 2200.00),                -- โต๊ะทำงาน
(32, 15, 1, 690.00), (32, 17, 1, 1450.00);-- เซรั่ม + น้ำหอม

-- 10. สถานะการจ่ายเงินให้ร้านค้า (Shop Payouts)
INSERT INTO Shop_Payout (shop_id, order_id, payout_date, net_amount, status) VALUES
(3, 13, '2026-06-08 10:00:00', 1212.60, 'completed'),
(4, 14, '2026-06-15 10:00:00', 601.60,  'completed'),
(5, 15, '2026-06-28 10:00:00', 1043.40, 'completed'),
(1, 16, '2026-07-10 10:00:00', 272.60,  'completed'),
(3, 17, '2026-07-18 10:00:00', 2387.60, 'completed'),
(2, 18, '2026-07-31 10:00:00', 423.00,  'completed'),
(5, 19, '2026-08-11 10:00:00', 1363.00, 'completed'),
(4, 20, '2026-08-17 10:00:00', 1353.60, 'completed'),
-- Order 21 ยกเลิก ไม่มี Payout
(1, 22, '2026-09-12 10:00:00', 1494.60, 'completed'),
(5, 23, '2026-09-21 10:00:00', 789.60,  'completed'),
(2, 24, '2026-09-28 10:00:00', 187.06,  'completed'),
(4, 25, '2026-10-13 10:00:00', 423.00,  'completed'),
(3, 26, '2026-10-25 10:00:00', 1457.00, 'completed'),
(5, 27, '2026-11-03 10:00:00', 141.00,  'completed'),
(2, 28, '2026-11-14 10:00:00', 846.00,  'completed'),
(3, 29, '2026-11-23 10:00:00', 930.60,  'completed'),
(4, 30, '2026-12-01 10:00:00', 1165.60, 'pending'), -- ออเดอร์ยังส่งไม่เสร็จ เงินยังไม่เข้า
(1, 31, '2026-12-08 10:00:00', 2068.00, 'pending'),
(5, 32, '2026-12-15 10:00:00', 2011.60, 'pending');