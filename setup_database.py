import sqlite3
import os
import datetime

# Ensure database directory exists
os.makedirs('database', exist_ok=True)

# Connect to the database
conn = sqlite3.connect('database/waste_management.db')
cursor = conn.cursor()

# Drop existing tables if they exist
cursor.executescript('''
DROP TABLE IF EXISTS discount_notifications;
DROP TABLE IF EXISTS purchase_history;
DROP TABLE IF EXISTS waste_records;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS categories;
''')

# Read and execute the schema SQL file
with open('database/schema.sql', 'r') as f:
    schema_sql = f.read()
    conn.executescript(schema_sql)

# Insert sample data for demonstration
def insert_sample_data():
    # Sample products with different expiry dates
    products = [
        ('Milk 1L', 'MILK001', 'Dairy', (datetime.date.today() + datetime.timedelta(days=7)).isoformat(), 
         (datetime.date.today() - datetime.timedelta(days=7)).isoformat(), 50, 'bottle', 2.99, None, 'A1', 'active'),
        ('Bread 500g', 'BREAD001', 'Bakery', (datetime.date.today() + datetime.timedelta(days=3)).isoformat(), 
         (datetime.date.today() - datetime.timedelta(days=1)).isoformat(), 30, 'loaf', 1.99, None, 'B2', 'active'),
        ('Apples 1kg', 'APPLE001', 'Produce', (datetime.date.today() + datetime.timedelta(days=14)).isoformat(), 
         (datetime.date.today() - datetime.timedelta(days=3)).isoformat(), 40, 'bag', 3.99, None, 'C3', 'active'),
        ('Chicken Breast 500g', 'CHICK001', 'Meat', (datetime.date.today() + datetime.timedelta(days=5)).isoformat(), 
         (datetime.date.today() - datetime.timedelta(days=2)).isoformat(), 20, 'package', 5.99, None, 'D4', 'active'),
        ('Yogurt 500g', 'YOGURT001', 'Dairy', (datetime.date.today() + datetime.timedelta(days=2)).isoformat(), 
         (datetime.date.today() - datetime.timedelta(days=10)).isoformat(), 25, 'container', 1.99, None, 'A2', 'active'),
        ('Pasta 1kg', 'PASTA001', 'Dry Goods', (datetime.date.today() + datetime.timedelta(days=180)).isoformat(), 
         (datetime.date.today() - datetime.timedelta(days=30)).isoformat(), 60, 'package', 2.49, None, 'E1', 'active'),
        ('Tomato Sauce 500g', 'SAUCE001', 'Canned Goods', (datetime.date.today() + datetime.timedelta(days=365)).isoformat(), 
         (datetime.date.today() - datetime.timedelta(days=60)).isoformat(), 35, 'jar', 1.79, None, 'E2', 'active'),
        ('Chocolate Bar 100g', 'CHOC001', 'Snacks', (datetime.date.today() + datetime.timedelta(days=90)).isoformat(), 
         (datetime.date.today() - datetime.timedelta(days=15)).isoformat(), 100, 'bar', 0.99, None, 'F3', 'active'),
        ('Orange Juice 1L', 'JUICE001', 'Beverages', (datetime.date.today() + datetime.timedelta(days=1)).isoformat(), 
         (datetime.date.today() - datetime.timedelta(days=14)).isoformat(), 15, 'bottle', 2.49, 1.99, 'G1', 'discounted'),
        ('Bananas 1kg', 'BANANA001', 'Produce', (datetime.date.today() - datetime.timedelta(days=1)).isoformat(), 
         (datetime.date.today() - datetime.timedelta(days=7)).isoformat(), 10, 'bunch', 1.99, 0.99, 'C1', 'expired')
    ]
    
    cursor.executemany('''
        INSERT INTO products (name, barcode, category, expiry_date, manufacture_date, quantity, unit, price, discounted_price, location, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', products)
    
    # Sample customers
    customers = [
        ('John Doe', 'john@example.com', '+1234567890', 'email'),
        ('Jane Smith', 'jane@example.com', '+1987654321', 'sms'),
        ('Bob Johnson', 'bob@example.com', '+1122334455', 'both')
    ]
    
    cursor.executemany('''
        INSERT INTO customers (name, email, phone, notification_preference)
        VALUES (?, ?, ?, ?)
    ''', customers)
    
    # Sample purchase history
    purchase_history = [
        (1, 1, 2, (datetime.date.today() - datetime.timedelta(days=5)).isoformat()),
        (1, 3, 1, (datetime.date.today() - datetime.timedelta(days=5)).isoformat()),
        (2, 2, 1, (datetime.date.today() - datetime.timedelta(days=3)).isoformat()),
        (2, 4, 1, (datetime.date.today() - datetime.timedelta(days=3)).isoformat()),
        (3, 1, 1, (datetime.date.today() - datetime.timedelta(days=7)).isoformat()),
        (3, 5, 2, (datetime.date.today() - datetime.timedelta(days=7)).isoformat()),
        (1, 9, 1, (datetime.date.today() - datetime.timedelta(days=10)).isoformat())
    ]
    
    cursor.executemany('''
        INSERT INTO purchase_history (customer_id, product_id, quantity, purchase_date)
        VALUES (?, ?, ?, ?)
    ''', purchase_history)
    
    # Sample waste records
    waste_records = [
        (10, 5, 'Organic', 1, 'Compost', (datetime.date.today()).isoformat(), 'Overripe bananas')
    ]
    
    cursor.executemany('''
        INSERT INTO waste_records (product_id, quantity, waste_type, recyclable, disposal_method, disposal_date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', waste_records)
    
    # Sample discount notifications
    discount_notifications = [
        (1, 9, (datetime.date.today() - datetime.timedelta(days=1)).isoformat(), 'email', 'sent')
    ]
    
    cursor.executemany('''
        INSERT INTO discount_notifications (customer_id, product_id, notification_date, notification_type, status)
        VALUES (?, ?, ?, ?, ?)
    ''', discount_notifications)
    
    conn.commit()

# Insert sample data
insert_sample_data()

print("Database setup complete with sample data.")
conn.close()
