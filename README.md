# Waste Management Automation System for Dark Stores

A comprehensive system for automating waste management in dark stores, optimizing inventory handling, and reducing waste through proactive tracking and discount strategies.

## Features

1. **Inventory Segregation & Arrangement**
   - Automatic categorization of items based on expiry date
   - First-Expiry-First-Out (FEFO) system implementation

2. **Waste Tracking & Discount Automation**
   - Inventory tracking with detailed fields
   - Automatic discounts for products nearing expiry
   - Customer notifications for discounted items

3. **Waste Management & Recycling**
   - Tracking of waste generation
   - Categorization of expired items into recyclable and non-recyclable waste

4. **Barcode & QR Code Integration**
   - Scanning functionality for automatic inventory addition
   - Auto-segregation based on product details
   - Sample barcode generation for demo products

5. **User Interface**
   - Clean and intuitive UI for inventory tracking and waste management
   - Clear data visualization and smooth navigation

## Technology Stack

- **Backend**: Python with Flask
- **Frontend**: React.js
- **Database**: SQLite for development, PostgreSQL for production
- **Barcode/QR Generation**: python-barcode and qrcode libraries
- **Styling**: CSS with Bootstrap

## Setup Instructions

1. Clone the repository
2. Install backend dependencies: `pip install -r requirements.txt`
3. Install frontend dependencies: `cd frontend && npm install`
4. Set up the database: `python setup_database.py`
5. Run the backend server: `python app.py`
6. Run the frontend development server: `cd frontend && npm start`

## Project Structure

```
waste_management_system/
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── routes.py
│   ├── utils.py
│   └── barcode_generator.py
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── App.js
├── database/
│   └── schema.sql
└── requirements.txt
```
# OverCloacked_Minds_Hackron
