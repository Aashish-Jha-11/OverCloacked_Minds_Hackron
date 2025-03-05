-- Database Schema for Waste Management System

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    barcode TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    manufacture_date DATE NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT NOT NULL,
    price REAL NOT NULL,
    discounted_price REAL,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    waste_type TEXT NOT NULL,
    recyclable BOOLEAN NOT NULL DEFAULT 0,
    discount_threshold INTEGER DEFAULT 7,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Waste Records Table
CREATE TABLE IF NOT EXISTS waste_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    waste_type TEXT NOT NULL,
    recyclable BOOLEAN NOT NULL,
    disposal_method TEXT NOT NULL,
    disposal_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    notification_preference TEXT NOT NULL DEFAULT 'email',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase History Table
CREATE TABLE IF NOT EXISTS purchase_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- Discount Notifications Table
CREATE TABLE IF NOT EXISTS discount_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    notification_date DATE NOT NULL,
    notification_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- Insert default categories
INSERT OR IGNORE INTO categories (name, description, waste_type, recyclable)
VALUES 
    ('Dairy', 'Milk, cheese, yogurt, etc.', 'Organic', 1),
    ('Bakery', 'Bread, pastries, etc.', 'Organic', 1),
    ('Produce', 'Fruits and vegetables', 'Organic', 1),
    ('Meat', 'Beef, chicken, pork, etc.', 'Organic', 0),
    ('Seafood', 'Fish, shellfish, etc.', 'Organic', 0),
    ('Frozen Foods', 'Frozen meals, ice cream, etc.', 'Mixed', 0),
    ('Canned Goods', 'Canned vegetables, soups, etc.', 'Recyclable', 1),
    ('Dry Goods', 'Rice, pasta, cereal, etc.', 'Recyclable', 1),
    ('Beverages', 'Soft drinks, juices, etc.', 'Recyclable', 1),
    ('Snacks', 'Chips, cookies, etc.', 'Mixed', 0),
    ('Household', 'Cleaning supplies, paper products, etc.', 'Non-recyclable', 0),
    ('Personal Care', 'Soap, shampoo, etc.', 'Non-recyclable', 0);
