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
-- ============================================================
-- MEGA SEED DATA BATCH: Ultimate Expansion
-- ============================================================

-- 1. เพิ่มผู้ใช้งานระดับ Mega (Users 16 - 35)
INSERT INTO "User" (firstname, lastname, username, email, password, phone_number, image_url, role, status) VALUES
('กิตติ',    'พงศ์พัฒน์',  'kitti',      'kitti@email.com',      'hashed_pw_16', '0811110001', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kitti',   'user', 'active'),
('ชลลดา',   'ใจดี',      'chonlada',   'chonlada@email.com',   'hashed_pw_17', '0811110002', 'https://api.dicebear.com/7.x/avataaars/svg?seed=chon',    'user', 'active'),
('ทวีศักดิ์',  'รุ่งเรือง',   'taweesak',   'taweesak@email.com',   'hashed_pw_18', '0811110003', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tawee',   'user', 'active'),
('นภัสสร',   'แสงอรุณ',   'napassorn',  'napassorn@email.com',  'hashed_pw_19', '0811110004', 'https://api.dicebear.com/7.x/avataaars/svg?seed=napas',   'user', 'active'),
('ปกรณ์',    'วิเศษไชย',  'pakorn',     'pakorn@email.com',     'hashed_pw_20', '0811110005', 'https://api.dicebear.com/7.x/avataaars/svg?seed=pakorn',  'user', 'active'),
('พัชราภา',  'งามเลิศ',   'patcharapa', 'patcharapa@email.com', 'hashed_pw_21', '0811110006', 'https://api.dicebear.com/7.x/avataaars/svg?seed=patcha',  'user', 'active'),
('มงคล',    'เจริญชัย',  'mongkol',    'mongkol@email.com',    'hashed_pw_22', '0811110007', null, 'user', 'active'),
('รัตนา',    'สุขเกษม',   'rattana',    'rattana@email.com',    'hashed_pw_23', '0811110008', null, 'user', 'inactive'),
('วิชัย',     'ทองดี',    'wichai',     'wichai@email.com',     'hashed_pw_24', '0811110009', 'https://api.dicebear.com/7.x/avataaars/svg?seed=wichai',  'user', 'active'),
('ศิริพร',    'บุญส่ง',    'siriporn',   'siriporn@email.com',   'hashed_pw_25', '0811110010', 'https://api.dicebear.com/7.x/avataaars/svg?seed=siri',    'user', 'active'),
('สมศักดิ์',   'พิทักษ์',    'somsak2',    'somsak2@email.com',    'hashed_pw_26', '0811110011', null, 'user', 'active'),
('อานนท์',   'สายทอง',   'arnon',      'arnon@email.com',      'hashed_pw_27', '0811110012', 'https://api.dicebear.com/7.x/avataaars/svg?seed=arnon',   'user', 'active'),
('เอกชัย',   'จันทร์เพ็ญ', 'ekkachai',   'ekkachai@email.com',   'hashed_pw_28', '0811110013', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ekka',    'user', 'active'),
('ฮันนี่',    'สวีท',      'honey_bot',  'honey@email.com',      'hashed_pw_29', '0811110014', null, 'user', 'suspended'),
('กาญจนา',  'ยอดเยี่ยม',  'kanjana',    'kanjana@email.com',    'hashed_pw_30', '0811110015', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kanjana', 'user', 'active');

-- 2. เพิ่มที่อยู่จัดส่งให้ผู้ใช้กลุ่มใหม่ (Addresses 11 - 25)
INSERT INTO User_Address (user_id, recipient_name, phone_number, address_detail, is_default) VALUES
(16, 'กิตติ พงศ์พัฒน์', '0811110001', '12/34 ถ.สุขุมวิท 71 แขวงพระโขนงเหนือ เขตวัฒนา กรุงเทพฯ 10110', TRUE),
(17, 'ชลลดา ใจดี',   '0811110002', '56/78 ถ.งามวงศ์วาน ต.บางเขน อ.เมือง จ.นนทบุรี 11000', TRUE),
(18, 'ทวีศักดิ์ รุ่งเรือง','0811110003', '90/12 ถ.รัตนาธิเบศร์ ต.ไทรม้า อ.เมือง จ.นนทบุรี 11000', TRUE),
(19, 'นภัสสร แสงอรุณ','0811110004', '34/56 ถ.แจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพฯ 10210', TRUE),
(20, 'ปกรณ์ วิเศษไชย','0811110005', '78/90 ถ.รามอินทรา แขวงคันนายาว เขตคันนายาว กรุงเทพฯ 10230', TRUE),
(21, 'พัชราภา งามเลิศ','0811110006', '12/34 ถ.เพชรเกษม แขวงบางแค เขตบางแค กรุงเทพฯ 10160', TRUE),
(22, 'มงคล เจริญชัย', '0811110007', '56/78 ถ.พระราม 2 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพฯ 10150', TRUE),
(24, 'วิชัย ทองดี',    '0811110009', '90/12 ถ.สุขสวัสดิ์ แขวงราษฎร์บูรณะ เขตราษฎร์บูรณะ กรุงเทพฯ 10140', TRUE),
(25, 'ศิริพร บุญส่ง',   '0811110010', '34/56 ถ.จรัญสนิทวงศ์ แขวงบางขุนศรี เขตบางกอกน้อย กรุงเทพฯ 10700', TRUE),
(26, 'สมศักดิ์ พิทักษ์',  '0811110011', '78/90 ถ.พหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400', TRUE),
(27, 'อานนท์ สายทอง', '0811110012', '12/34 ถ.ลาดพร้าว แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900', TRUE),
(28, 'เอกชัย จันทร์เพ็ญ','0811110013', '56/78 ถ.รัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400', TRUE),
(30, 'กาญจนา ยอดเยี่ยม','0811110015', '90/12 ถ.วิภาวดีรังสิต แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900', TRUE),
(16, 'กิตติ พงศ์พัฒน์ (ออฟฟิศ)', '0811110001', 'ตึก Empire Tower ถ.สาทรใต้ กรุงเทพฯ 10120', FALSE),
(17, 'ชลลดา ใจดี (บ้านแม่)', '0811110002', '111 หมู่ 5 ต.บ้านปง อ.หางดง จ.เชียงใหม่ 50230', FALSE);

-- 3. เพิ่มหมวดหมู่ Global ระดับ Mega (IDs 7 - 10)
INSERT INTO Global_Category (category_name, image_url) VALUES
('สัตว์เลี้ยง',         'https://img.icons8.com/color/96/cat.png'),
('หนังสือและเครื่องเขียน', 'https://img.icons8.com/color/96/books.png'),
('ของเล่นและงานอดิเรก',  'https://img.icons8.com/color/96/lego.png'),
('ยานยนต์และอุปกรณ์',    'https://img.icons8.com/color/96/car.png');

-- 4. เพิ่มร้านค้าขนาดใหญ่ (Shops 6 - 12)
INSERT INTO Shop (user_id, shop_name, shop_description, logo_url, status) VALUES
(16, 'PetLover Club',      'อาหารและของเล่นสัตว์เลี้ยงพรีเมียม', null, 'active'),
(17, 'Read & Write Store', 'หนังสือน่าอ่านและเครื่องเขียนน่ารักๆ', null, 'active'),
(18, 'Geeky Toys',         'โมเดล ฟิกเกอร์ และบอร์ดเกม',    null, 'active'),
(19, 'AutoParts Direct',   'อะไหล่แต่งรถและน้ำยาล้างรถ',    null, 'active'),
(20, 'Healthy Kitchen',    'อาหารคลีน ขนมคีโตเพื่อสุขภาพ',   null, 'active'),
(21, 'Smart Home BKK',     'อุปกรณ์สมาร์ทโฮม IoT ครบวงจร',   null, 'active'),
(24, 'Vintage Wardrobe',   'เสื้อผ้าวินเทจมือสองสภาพนางฟ้า',   null, 'active');

-- 5. เพิ่ม Local Category ให้ร้านใหม่ (IDs 11 - 22)
INSERT INTO Local_Category (shop_id, global_cat_id, category_name, image_url) VALUES
(6, 7, 'อาหารแมว',       null),
(6, 7, 'อุปกรณ์ของใช้หมาแมว', null),
(7, 8, 'นิยายแปล',       null),
(7, 8, 'เครื่องเขียน',      null),
(8, 9, 'บอร์ดเกม',       null),
(8, 9, 'ฟิกเกอร์อนิเมะ',    null),
(9, 10,'น้ำยาดูแลรถ',     null),
(10,4, 'ขนมคีโต',        null),
(11,1, 'Smart Camera', null),
(11,1, 'Smart Sensor', null),
(12,2, 'แจ็คเก็ตยีนส์',     null),
(12,2, 'เดรสวินเทจ',     null);

-- 6. เพิ่มสินค้าจำนวนมาก (Products 22 - 45)
INSERT INTO Product (shop_id, local_cat_id, product_name, description, price, image_url) VALUES
(6, 11, 'อาหารแมวพรีเมียม 1.5kg',    'สูตรบำรุงขนและลดก้อนขน',           500.00, null),
(6, 12, 'ทรายแมวเต้าหู้ 6L',         'ฝุ่นน้อย จับตัวเป็นก้อนเร็ว',           200.00, null),
(6, 12, 'คอนโดแมว 3 ชั้น',          'ไม้แข็งแรง หุ้มผ้ากำมะหยี่นุ่ม',         1500.00, null),
(7, 13, 'แฮร์รี่ พอตเตอร์ เล่ม 1',      'ฉบับฉลองครบรอบ ปกแข็ง',          500.00, null),
(7, 14, 'ปากกาเจล Muji 0.5',       'หมึกดำ แพ็ค 5 แท่ง',              200.00, null),
(8, 15, 'เกม Catan (ภาษาไทย)',    'บอร์ดเกมสร้างเมืองยอดฮิต',           1500.00, null),
(8, 16, 'โมเดลวันพีช ลูฟี่ เกียร์ 5',    'ฟิกเกอร์แท้จากญี่ปุ่น ความสูง 20cm',    3000.00, null),
(9, 17, 'แชมพูล้างรถเคลือบเงา',       'สูตรผสมแว็กซ์ ล้างพร้อมเคลือบในตัว',    500.00, null),
(9, 17, 'น้ำยาเคลือบกระจกกันน้ำ',      'ป้องกันน้ำเกาะกระจก ทัศนวิสัยดีเยี่ยม',   200.00, null),
(10,18, 'บราวนี่คีโต ไร้แป้ง',         'ใช้หญ้าหวานและอัลมอนด์ (กล่อง 6 ชิ้น)', 200.00, null),
(10,18, 'เนยถั่วคลีน 100%',         'ไม่เติมน้ำตาล ไม่ใส่น้ำมันเพิ่ม',       150.00, null),
(11,19, 'กล้องวงจรปิด Wi-Fi',       'ความละเอียด 2K หมุนได้ 360 องศา', 1000.00, null),
(11,20, 'เซ็นเซอร์ประตูอัจฉริยะ',      'แจ้งเตือนผ่านมือถือเมื่อประตูเปิด',      500.00, null),
(11,20, 'หลอดไฟเปลี่ยนสี Smart LED','สั่งงานด้วยเสียง ควบคุมผ่านแอป',      500.00, null),
(12,21, 'แจ็คเก็ตยีนส์ Levi''s มือสอง',  'สียีนส์ฟอก ไซส์ L สภาพ 95%',      1500.00, null),
(12,22, 'เดรสลายดอกวินเทจ',        'เดรสนำเข้าจากญี่ปุ่น งานป้าย',         500.00, null),
(6, 11, 'ขนมแมวเลีย ทูน่า',         'แพ็ค 20 ซอง',                   200.00, null),
(7, 13, 'Atomic Habits (TH)',   'หนังสือพัฒนาตัวเอง Best Seller',     300.00, null),
(8, 15, 'เกมตึกถล่ม Jenga',       'เกมครอบครัว ไม้แท้คลาสสิก',         500.00, null),
(10,18, 'Granola เบอร์รี่รวม',      'อบกรอบไร้น้ำตาล 500g',           300.00, null),
(1, 1,  'ไดร์เป่าผม 2000W',        'ลมแรง แห้งไว ถนอมเส้นผม',         1000.00, null),
(2, 3,  'เสื้อฮู้ด สีพื้น',             'ผ้าหนานุ่ม กันหนาวได้ดี',            500.00, null),
(3, 5,  'สายชาร์จ Type-C 2m',     'รองรับชาร์จไว 65W ถักไนลอน',       200.00, null),
(4, 8,  'ลูกกลิ้งออกกำลังกาย',        'Ab Wheel แกนเหล็กแข็งแรง',       300.00, null);

-- 7. เพิ่มสต็อกสินค้า (Inventory 22 - 45)
INSERT INTO Inventory (product_id, quantity) VALUES
(22, 50), (23, 100), (24, 15), (25, 40), (26, 200), (27, 20), (28, 5),
(29, 80), (30, 150), (31, 60), (32, 90), (33, 45), (34, 100), (35, 120),
(36, 1),  (37, 2),   (38, 300), (39, 70), (40, 40), (41, 150), (42, 60),
(43, 80), (44, 200), (45, 90);

-- ============================================================
-- MEGA ORDERS BATCH (50 Orders)
-- คำนวณ Platform Fee = 6% เสมอ
-- 1000: Net=940(Fee=60), 500: Net=470(Fee=30), 1500: Net=1410(Fee=90), 200: Net=188(Fee=12), 300: Net=282(Fee=18)
-- ============================================================

INSERT INTO "Order" (user_id, shop_id, address_id, order_date, total_amount, net_amount, platform_fee, payment_method, payment_timestamp, shipping_status, order_status) VALUES
-- มกราคม 2026
(16, 6, 11, '2026-01-05 10:00:00', 1000.00, 940.00,  60.00, 'credit_card', '2026-01-05 10:05:00', 'delivered', 'completed'), -- อาหารแมว x2
(17, 7, 12, '2026-01-12 14:30:00', 500.00,  470.00,  30.00, 'promptpay',   '2026-01-12 14:32:00', 'delivered', 'completed'), -- แฮร์รี่ 
(18, 8, 13, '2026-01-20 20:15:00', 1500.00, 1410.00, 90.00, 'credit_card', '2026-01-20 20:15:00', 'delivered', 'completed'), -- Catan
(19, 9, 14, '2026-01-25 09:00:00', 700.00,  658.00,  42.00, 'promptpay',   '2026-01-25 09:10:00', 'delivered', 'completed'), -- แชมพูล้างรถ + เคลือบกระจก
-- กุมภาพันธ์ 2026
(20, 10, 15, '2026-02-02 11:45:00', 500.00,  470.00,  30.00, 'credit_card', '2026-02-02 11:45:00', 'delivered', 'completed'), -- บราวนี่ + กราโนล่า
(21, 11, 16, '2026-02-14 16:20:00', 2000.00, 1880.00, 120.00,'promptpay',   '2026-02-14 16:25:00', 'delivered', 'completed'), -- กล้อง x2
(22, 12, 17, '2026-02-28 12:00:00', 1500.00, 1410.00, 90.00, 'credit_card', '2026-02-28 12:02:00', 'returned',  'cancelled'), -- แจ็คเก็ต (คืน)
-- มีนาคม 2026
(24, 6, 18, '2026-03-05 18:30:00', 700.00,  658.00,  42.00, 'promptpay',   '2026-03-05 18:35:00', 'delivered', 'completed'), -- อาหารแมว + ทราย
(25, 7, 19, '2026-03-15 21:10:00', 500.00,  470.00,  30.00, 'credit_card', '2026-03-15 21:10:00', 'delivered', 'completed'), -- ปากกา + Atomic
(26, 8, 20, '2026-03-25 09:09:00', 3000.00, 2820.00, 180.00,'promptpay',   '2026-03-25 09:15:00', 'delivered', 'completed'), -- โมเดลวันพีช
-- เมษายน 2026 (สงกรานต์)
(27, 9, 21, '2026-04-10 10:20:00', 1000.00, 940.00,  60.00, 'credit_card', '2026-04-10 10:20:00', 'delivered', 'completed'), -- แชมพูล้างรถ x2
(28, 10, 22,'2026-04-15 15:40:00', 600.00,  564.00,  36.00, 'promptpay',   '2026-04-15 15:45:00', 'delivered', 'completed'), -- บราวนี่ x3
(30, 11, 23,'2026-04-22 10:10:00', 1500.00, 1410.00, 90.00, 'credit_card', '2026-04-22 10:10:00', 'delivered', 'completed'), -- กล้อง + เซ็นเซอร์
(16, 12, 11,'2026-04-30 14:00:00', 500.00,  470.00,  30.00, 'promptpay',   '2026-04-30 14:05:00', 'delivered', 'completed'), -- เดรสวินเทจ
-- พฤษภาคม - ตุลาคม 2026 (รัวออเดอร์)
(17, 6, 12, '2026-05-05 23:50:00', 1500.00, 1410.00, 90.00, 'credit_card', '2026-05-05 23:55:00', 'delivered', 'completed'), -- คอนโดแมว
(18, 7, 13, '2026-06-06 11:11:00', 500.00,  470.00,  30.00, 'promptpay',   '2026-06-06 11:15:00', 'delivered', 'completed'), -- แฮร์รี่
(19, 8, 14, '2026-07-07 13:30:00', 500.00,  470.00,  30.00, 'credit_card', '2026-07-07 13:30:00', 'delivered', 'completed'), -- Jenga
(20, 9, 15, '2026-08-08 17:45:00', 600.00,  564.00,  36.00, 'promptpay',   '2026-08-08 17:50:00', 'delivered', 'completed'), -- น้ำยาเคลือบ x3
(21, 10, 16,'2026-09-09 08:20:00', 300.00,  282.00,  18.00, 'credit_card', '2026-09-09 08:20:00', 'delivered', 'completed'), -- กราโนล่า
(22, 11, 17,'2026-10-10 12:12:00', 1000.00, 940.00,  60.00, 'promptpay',   '2026-10-10 12:15:00', 'delivered', 'completed'), -- หลอดไฟ x2
-- พฤศจิกายน 2026 (เดือนที่มี Big Sale 11.11)
(24, 6, 18, '2026-11-11 00:05:00', 2000.00, 1880.00, 120.00,'credit_card', '2026-11-11 00:05:00', 'delivered', 'completed'),
(25, 7, 19, '2026-11-11 01:20:00', 800.00,  752.00,  48.00, 'promptpay',   '2026-11-11 01:20:00', 'delivered', 'completed'),
(26, 8, 20, '2026-11-11 10:30:00', 4500.00, 4230.00, 270.00,'credit_card', '2026-11-11 10:30:00', 'delivered', 'completed'),
(27, 9, 21, '2026-11-11 12:00:00', 1200.00, 1128.00, 72.00, 'promptpay',   '2026-11-11 12:00:00', 'delivered', 'completed'),
(28, 10, 22,'2026-11-11 15:45:00', 500.00,  470.00,  30.00, 'credit_card', '2026-11-11 15:45:00', 'delivered', 'completed'),
-- ธันวาคม 2026 (สิ้นปีรัวๆ - กำลังส่ง/รอดำเนินการ)
(30, 11, 23,'2026-12-25 09:00:00', 1500.00, 1410.00, 90.00, 'credit_card', '2026-12-25 09:00:00', 'shipping',  'pending'),
(16, 6, 11, '2026-12-26 10:30:00', 700.00,  658.00,  42.00, 'promptpay',   '2026-12-26 10:30:00', 'shipping',  'pending'),
(17, 7, 12, '2026-12-27 14:15:00', 500.00,  470.00,  30.00, 'credit_card', '2026-12-27 14:15:00', 'shipping',  'pending'),
(18, 1, 13, '2026-12-28 11:20:00', 1000.00, 940.00,  60.00, 'promptpay',   '2026-12-28 11:20:00', 'shipping',  'pending'),
(19, 2, 14, '2026-12-29 16:40:00', 500.00,  470.00,  30.00, 'credit_card', '2026-12-29 16:40:00', 'shipping',  'pending');

-- ============================================================
-- Order Items for the Mega Batch
-- (จับคู่ Order ID 33 ถึง 62 ให้ตรงกับ Product ด้านบน)
-- ============================================================

INSERT INTO Order_Item (order_id, product_id, quantity, price_at_purchase) VALUES
(33, 22, 2, 500.00),                 -- ออเดอร์ 33: อาหารแมว x2 = 1000
(34, 25, 1, 500.00),                 -- ออเดอร์ 34: แฮร์รี่ 1 = 500
(35, 27, 1, 1500.00),                -- ออเดอร์ 35: Catan = 1500
(36, 29, 1, 500.00), (36, 30, 1, 200.00), -- ออเดอร์ 36: แชมพู + เคลือบกระจก = 700
(37, 31, 1, 200.00), (37, 41, 1, 300.00), -- ออเดอร์ 37: บราวนี่ + กราโนล่า = 500
(38, 33, 2, 1000.00),                -- ออเดอร์ 38: กล้องวงจรปิด x2 = 2000
(39, 36, 1, 1500.00),                -- ออเดอร์ 39: แจ็คเก็ต = 1500 (คืนของ)
(40, 22, 1, 500.00), (40, 23, 1, 200.00), -- ออเดอร์ 40: อาหารแมว + ทราย = 700
(41, 26, 1, 200.00), (41, 39, 1, 300.00), -- ออเดอร์ 41: ปากกา + Atomic = 500
(42, 28, 1, 3000.00),                -- ออเดอร์ 42: โมเดลวันพีช = 3000
(43, 29, 2, 500.00),                 -- ออเดอร์ 43: แชมพูล้างรถ x2 = 1000
(44, 31, 3, 200.00),                 -- ออเดอร์ 44: บราวนี่ x3 = 600
(45, 33, 1, 1000.00), (45, 34, 1, 500.00),-- ออเดอร์ 45: กล้อง + เซ็นเซอร์ = 1500
(46, 37, 1, 500.00),                 -- ออเดอร์ 46: เดรสวินเทจ = 500
(47, 24, 1, 1500.00),                -- ออเดอร์ 47: คอนโดแมว = 1500
(48, 25, 1, 500.00),                 -- ออเดอร์ 48: แฮร์รี่ = 500
(49, 40, 1, 500.00),                 -- ออเดอร์ 49: Jenga = 500
(50, 30, 3, 200.00),                 -- ออเดอร์ 50: เคลือบกระจก x3 = 600
(51, 41, 1, 300.00),                 -- ออเดอร์ 51: กราโนล่า = 300
(52, 35, 2, 500.00),                 -- ออเดอร์ 52: หลอดไฟ x2 = 1000
(53, 24, 1, 1500.00), (53, 22, 1, 500.00),-- ออเดอร์ 53: คอนโดแมว + อาหารแมว = 2000
(54, 25, 1, 500.00), (54, 39, 1, 300.00), -- ออเดอร์ 54: แฮร์รี่ + Atomic = 800
(55, 28, 1, 3000.00), (55, 27, 1, 1500.00),-- ออเดอร์ 55: โมเดล + Catan = 4500
(56, 29, 2, 500.00), (56, 30, 1, 200.00), -- ออเดอร์ 56: แชมพู x2 + เคลือบ = 1200
(57, 31, 1, 200.00), (57, 41, 1, 300.00), -- ออเดอร์ 57: บราวนี่ + กราโนล่า = 500
(58, 33, 1, 1000.00), (58, 34, 1, 500.00),-- ออเดอร์ 58: กล้อง + เซ็นเซอร์ = 1500
(59, 22, 1, 500.00), (59, 23, 1, 200.00), -- ออเดอร์ 59: อาหารแมว + ทราย = 700
(60, 25, 1, 500.00),                 -- ออเดอร์ 60: แฮร์รี่ = 500
(61, 42, 1, 1000.00),                -- ออเดอร์ 61: ไดร์เป่าผม (Product ของร้านเก่า ID 1)
(62, 43, 1, 500.00);                 -- ออเดอร์ 62: เสื้อฮู้ด (Product ของร้านเก่า ID 2)

-- ============================================================
-- Mega Shop Payouts
-- บันทึกสถานะการโอนเงินให้ร้านค้า
-- ============================================================

INSERT INTO Shop_Payout (shop_id, order_id, payout_date, net_amount, status) VALUES
(6, 33, '2026-01-08 10:00:00', 940.00,  'completed'),
(7, 34, '2026-01-15 10:00:00', 470.00,  'completed'),
(8, 35, '2026-01-23 10:00:00', 1410.00, 'completed'),
(9, 36, '2026-01-28 10:00:00', 658.00,  'completed'),
(10,37, '2026-02-05 10:00:00', 470.00,  'completed'),
(11,38, '2026-02-17 10:00:00', 1880.00, 'completed'),
-- ออเดอร์ 39 ยกเลิก (ไม่มี Payout)
(6, 40, '2026-03-08 10:00:00', 658.00,  'completed'),
(7, 41, '2026-03-18 10:00:00', 470.00,  'completed'),
(8, 42, '2026-03-28 10:00:00', 2820.00, 'completed'),
(9, 43, '2026-04-13 10:00:00', 940.00,  'completed'),
(10,44, '2026-04-18 10:00:00', 564.00,  'completed'),
(11,45, '2026-04-25 10:00:00', 1410.00, 'completed'),
(12,46, '2026-05-03 10:00:00', 470.00,  'completed'),
(6, 47, '2026-05-08 10:00:00', 1410.00, 'completed'),
(7, 48, '2026-06-09 10:00:00', 470.00,  'completed'),
(8, 49, '2026-07-10 10:00:00', 470.00,  'completed'),
(9, 50, '2026-08-11 10:00:00', 564.00,  'completed'),
(10,51, '2026-09-12 10:00:00', 282.00,  'completed'),
(11,52, '2026-10-13 10:00:00', 940.00,  'completed'),
(6, 53, '2026-11-14 10:00:00', 1880.00, 'completed'),
(7, 54, '2026-11-14 10:00:00', 752.00,  'completed'),
(8, 55, '2026-11-14 10:00:00', 4230.00, 'completed'),
(9, 56, '2026-11-14 10:00:00', 1128.00, 'completed'),
(10,57, '2026-11-14 10:00:00', 470.00,  'completed'),
-- ออเดอร์ 58-62 ยังอยู่ในสถานะ shipping จึงเป็น pending หมด
(11,58, '2026-12-30 10:00:00', 1410.00, 'pending'),
(6, 59, '2026-12-30 10:00:00', 658.00,  'pending'),
(7, 60, '2026-12-30 10:00:00', 470.00,  'pending'),
(1, 61, '2026-12-30 10:00:00', 940.00,  'pending'),
(2, 62, '2026-12-30 10:00:00', 470.00,  'pending');

INSERT INTO "User" (firstname, lastname, username, email, password, phone_number, image_url, role, status) 
VALUES (
  'Handsome', 
  'Iear', 
  'handsomeiear', 
  'hansomiear@email.com', 
  'iearhandsome', -- หมายเหตุ: ในระบบจริงควรเป็น Hashed Password
  '0899999999', 
  'https://api.dicebear.com/7.x/avataaars/svg?seed=handsome', 
  'admin', 
  'active'
);

INSERT INTO Shop (user_id, shop_name, shop_description, logo_url, status) 
VALUES (
  (SELECT user_id FROM "User" WHERE username = 'handsomeiear'), -- ID ที่ได้จากตาราง User ด้านบน
  'Handsome Iear Shop', 
  'ร้านค้าสุดหล่อของ Iear จัดเต็มทุกโปรโมชั่น', 
  null, 
  'active'
);
