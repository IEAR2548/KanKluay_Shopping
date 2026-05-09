-- ============================================================
--  KanKluay E-Commerce Schema
-- ============================================================

CREATE TABLE "User" (
    user_id      SERIAL PRIMARY KEY,
    firstname    VARCHAR(50)  NOT NULL,
    lastname     VARCHAR(50)  NOT NULL,
    username     VARCHAR(50)  NOT NULL UNIQUE,
    email        VARCHAR(100) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15),
    role         VARCHAR(20)  NOT NULL DEFAULT 'user'
                              CHECK (role IN ('user', 'admin')),
    status       VARCHAR(20)  NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE User_Address (
    address_id     SERIAL PRIMARY KEY,
    user_id        INTEGER      NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,
    recipient_name VARCHAR(100) NOT NULL,
    phone_number   VARCHAR(15)  NOT NULL,
    address_detail TEXT         NOT NULL,
    is_default     BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE TABLE Shop (
    shop_id          SERIAL PRIMARY KEY,
    user_id          INTEGER      NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,
    shop_name        VARCHAR(100) NOT NULL,
    shop_description TEXT,
    status           VARCHAR(20)  NOT NULL DEFAULT 'active'
                                  CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE Global_Category (
    global_cat_id SERIAL PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL
);

CREATE TABLE Local_Category (
    local_cat_id  SERIAL PRIMARY KEY,
    shop_id       INTEGER     NOT NULL REFERENCES Shop(shop_id) ON DELETE CASCADE,
    global_cat_id INTEGER     NOT NULL REFERENCES Global_Category(global_cat_id) ON DELETE RESTRICT,
    category_name VARCHAR(50) NOT NULL
);

CREATE TABLE Product (
    product_id   SERIAL PRIMARY KEY,
    shop_id      INTEGER        NOT NULL REFERENCES Shop(shop_id) ON DELETE CASCADE,
    local_cat_id INTEGER        NOT NULL REFERENCES Local_Category(local_cat_id) ON DELETE RESTRICT,
    product_name VARCHAR(255)   NOT NULL,
    description  TEXT,
    price        DECIMAL(10, 2) NOT NULL
);

CREATE TABLE Inventory (
    product_id   INTEGER   NOT NULL PRIMARY KEY REFERENCES Product(product_id) ON DELETE CASCADE,
    quantity     INTEGER   NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Cart (
    cart_id    SERIAL PRIMARY KEY,
    user_id    INTEGER   NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Cart_Item (
    cart_id    INTEGER NOT NULL REFERENCES Cart(cart_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES Product(product_id) ON DELETE CASCADE,
    quantity   INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (cart_id, product_id)
);

CREATE TABLE "Order" (
    order_id          SERIAL PRIMARY KEY,
    user_id           INTEGER        NOT NULL REFERENCES "User"(user_id) ON DELETE RESTRICT,
    shop_id           INTEGER        NOT NULL REFERENCES Shop(shop_id) ON DELETE RESTRICT,
    address_id        INTEGER        NOT NULL REFERENCES User_Address(address_id) ON DELETE RESTRICT,
    order_date        TIMESTAMP      NOT NULL DEFAULT NOW(),
    total_amount      DECIMAL(10, 2) NOT NULL,
    net_amount        DECIMAL(10, 2) NOT NULL,
    platform_fee      DECIMAL(10, 2) NOT NULL,
    payment_method    VARCHAR(50),
    payment_timestamp TIMESTAMP,
    shipping_status   VARCHAR(20)    NOT NULL DEFAULT 'pending',
    order_status      VARCHAR(20)    NOT NULL DEFAULT 'pending'
);

CREATE TABLE Order_Item (
    order_id          INTEGER        NOT NULL REFERENCES "Order"(order_id) ON DELETE CASCADE,
    product_id        INTEGER        NOT NULL REFERENCES Product(product_id) ON DELETE RESTRICT,
    quantity          INTEGER        NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id, product_id)
);

CREATE TABLE Shop_Payout (
    payout_id   SERIAL PRIMARY KEY,
    shop_id     INTEGER        NOT NULL REFERENCES Shop(shop_id) ON DELETE RESTRICT,
    order_id    INTEGER        NOT NULL REFERENCES "Order"(order_id) ON DELETE RESTRICT,
    payout_date TIMESTAMP      NOT NULL DEFAULT NOW(),
    net_amount  DECIMAL(10, 2) NOT NULL,
    status      VARCHAR(20)    NOT NULL DEFAULT 'pending'
);