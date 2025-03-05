from flask import Blueprint, request, jsonify
from backend.models import db, Product, Category, WasteRecord, Customer, PurchaseHistory, DiscountNotification
from backend.models import ProductStatus, WasteType, NotificationType, NotificationStatus
from datetime import datetime, timedelta
from backend import utils
from backend.barcode_generator import BarcodeGenerator
import json
import csv
import io

api = Blueprint('api', __name__)

# Product Routes
@api.route('/products', methods=['GET'])
def get_products():
    """Get all products with optional filtering"""
    status = request.args.get('status')
    category = request.args.get('category')
    expiry_days = request.args.get('expiry_days')
    
    query = Product.query
    
    if status:
        query = query.filter_by(status=status)
    
    if category:
        query = query.filter_by(category=category)
    
    if expiry_days:
        try:
            days = int(expiry_days)
            target_date = datetime.utcnow().date() + timedelta(days=days)
            query = query.filter(Product.expiry_date <= target_date)
        except ValueError:
            return jsonify({'error': 'Invalid expiry_days parameter'}), 400
    
    products = query.all()
    return jsonify([product.to_dict() for product in products])

@api.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product by ID"""
    product = Product.query.get_or_404(product_id)
    return jsonify(product.to_dict())

@api.route('/products', methods=['POST'])
def create_product():
    """Create a new product"""
    data = request.json
    
    # Generate barcode if not provided
    if 'barcode' not in data or not data['barcode']:
        data['barcode'] = utils.generate_barcode()
    
    # Convert string dates to datetime objects
    if 'expiry_date' in data:
        try:
            data['expiry_date'] = datetime.fromisoformat(data['expiry_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid expiry_date format'}), 400
    
    if 'manufacture_date' in data:
        try:
            data['manufacture_date'] = datetime.fromisoformat(data['manufacture_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid manufacture_date format'}), 400
    
    # Create new product
    product = Product(
        name=data.get('name'),
        barcode=data.get('barcode'),
        category=data.get('category'),
        expiry_date=data.get('expiry_date'),
        manufacture_date=data.get('manufacture_date'),
        quantity=data.get('quantity', 0),
        unit=data.get('unit', 'unit'),
        price=data.get('price', 0.0),
        location=data.get('location', 'Unknown'),
        status=data.get('status', ProductStatus.ACTIVE.value)
    )
    
    db.session.add(product)
    
    try:
        db.session.commit()
        # Check expiry status immediately
        product.check_expiry_status()
        return jsonify(product.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """Update an existing product"""
    product = Product.query.get_or_404(product_id)
    data = request.json
    
    # Update fields
    if 'name' in data:
        product.name = data['name']
    if 'category' in data:
        product.category = data['category']
    if 'expiry_date' in data:
        try:
            product.expiry_date = datetime.fromisoformat(data['expiry_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid expiry_date format'}), 400
    if 'manufacture_date' in data:
        try:
            product.manufacture_date = datetime.fromisoformat(data['manufacture_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid manufacture_date format'}), 400
    if 'quantity' in data:
        product.quantity = data['quantity']
    if 'unit' in data:
        product.unit = data['unit']
    if 'price' in data:
        product.price = data['price']
    if 'discounted_price' in data:
        product.discounted_price = data['discounted_price']
    if 'location' in data:
        product.location = data['location']
    if 'status' in data:
        product.status = data['status']
    
    try:
        db.session.commit()
        # Check expiry status after update
        product.check_expiry_status()
        return jsonify(product.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete a product"""
    product = Product.query.get_or_404(product_id)
    
    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': f'Product {product_id} deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api.route('/products/scan', methods=['POST'])
def scan_product():
    """Scan a product barcode or QR code"""
    data = request.json
    barcode = data.get('barcode')
    
    if not barcode:
        return jsonify({'error': 'Barcode is required'}), 400
    
    # Look up product by barcode
    product = Product.query.filter_by(barcode=barcode).first()
    
    if not product:
        # If product doesn't exist, return placeholder data
        return jsonify({
            'found': False,
            'barcode': barcode,
            'message': 'Product not found'
        })
    
    # Check expiry status
    product.check_expiry_status()
    
    return jsonify({
        'found': True,
        'product': product.to_dict()
    })

@api.route('/products/barcode/generate', methods=['POST'])
def generate_barcode():
    """Generate a barcode or QR code for a product"""
    data = request.json
    product_data = data.get('product_data', {})
    code_type = data.get('code_type', 'barcode')  # 'barcode' or 'qrcode'
    
    if not product_data:
        return jsonify({'error': 'Product data is required'}), 400
    
    try:
        if code_type == 'qrcode':
            image_data = BarcodeGenerator.generate_qr_code(product_data)
        else:
            image_data = BarcodeGenerator.generate_barcode(product_data)
        
        return jsonify({
            'image_data': image_data,
            'code_type': code_type
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@api.route('/products/barcode/samples', methods=['GET'])
def get_sample_barcodes():
    """Get sample barcodes for demo purposes"""
    count = request.args.get('count', 5, type=int)
    samples = BarcodeGenerator.generate_sample_barcodes(count)
    return jsonify(samples)

# Category Routes
@api.route('/categories', methods=['GET'])
def get_categories():
    """Get all categories"""
    categories = Category.query.all()
    return jsonify([category.to_dict() for category in categories])

@api.route('/categories/<int:category_id>', methods=['GET'])
def get_category(category_id):
    """Get a single category by ID"""
    category = Category.query.get_or_404(category_id)
    return jsonify(category.to_dict())

@api.route('/categories', methods=['POST'])
def create_category():
    """Create a new category"""
    data = request.json
    
    category = Category(
        name=data.get('name'),
        description=data.get('description'),
        waste_type=data.get('waste_type', WasteType.MIXED.value),
        recyclable=data.get('recyclable', False),
        discount_threshold=data.get('discount_threshold', 7)
    )
    
    db.session.add(category)
    
    try:
        db.session.commit()
        return jsonify(category.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Waste Record Routes
@api.route('/waste-records', methods=['GET'])
def get_waste_records():
    """Get all waste records with optional filtering"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    waste_type = request.args.get('waste_type')
    
    query = WasteRecord.query
    
    if start_date:
        try:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00')).date()
            query = query.filter(WasteRecord.disposal_date >= start)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format'}), 400
    
    if end_date:
        try:
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00')).date()
            query = query.filter(WasteRecord.disposal_date <= end)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format'}), 400
    
    if waste_type:
        query = query.filter_by(waste_type=waste_type)
    
    waste_records = query.all()
    return jsonify([record.to_dict() for record in waste_records])

@api.route('/waste-records', methods=['POST'])
def create_waste_record():
    """Create a new waste record"""
    data = request.json
    
    # Convert string date to datetime object
    if 'disposal_date' in data:
        try:
            data['disposal_date'] = datetime.fromisoformat(data['disposal_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid disposal_date format'}), 400
    else:
        data['disposal_date'] = datetime.utcnow()
    
    waste_record = WasteRecord(
        product_id=data.get('product_id'),
        quantity=data.get('quantity', 0),
        waste_type=data.get('waste_type', WasteType.MIXED.value),
        recyclable=data.get('recyclable', False),
        disposal_method=data.get('disposal_method', 'Unknown'),
        disposal_date=data.get('disposal_date'),
        notes=data.get('notes')
    )
    
    db.session.add(waste_record)
    
    # Update product status if needed
    if data.get('update_product_status', True):
        product = Product.query.get(data.get('product_id'))
        if product:
            product.status = ProductStatus.DISPOSED.value
            product.quantity = 0
    
    try:
        db.session.commit()
        return jsonify(waste_record.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api.route('/waste-statistics', methods=['GET'])
def get_waste_statistics():
    """Get waste statistics"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if start_date:
        try:
            start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00')).date()
        except ValueError:
            return jsonify({'error': 'Invalid start_date format'}), 400
    
    if end_date:
        try:
            end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00')).date()
        except ValueError:
            return jsonify({'error': 'Invalid end_date format'}), 400
    
    statistics = utils.get_waste_statistics(start_date, end_date)
    return jsonify(statistics)

@api.route('/waste-statistics/by-category', methods=['GET'])
def get_waste_by_category():
    """Get waste statistics grouped by category"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if start_date:
        try:
            start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00')).date()
        except ValueError:
            return jsonify({'error': 'Invalid start_date format'}), 400
    
    if end_date:
        try:
            end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00')).date()
        except ValueError:
            return jsonify({'error': 'Invalid end_date format'}), 400
    
    # Query waste records for the given date range
    query = WasteRecord.query
    
    if start_date:
        query = query.filter(WasteRecord.disposal_date >= start_date)
    
    if end_date:
        query = query.filter(WasteRecord.disposal_date <= end_date)
    
    waste_records = query.all()
    
    # Group by category
    waste_by_category = []
    category_totals = {}
    
    for record in waste_records:
        product = Product.query.get(record.product_id)
        if not product:
            continue
            
        category = product.category
        if category not in category_totals:
            category_totals[category] = 0
        
        category_totals[category] += record.quantity
    
    for category, total_quantity in category_totals.items():
        waste_by_category.append({
            'category': category,
            'total_quantity': total_quantity
        })
    
    return jsonify(waste_by_category)

@api.route('/waste-statistics/over-time', methods=['GET'])
def get_waste_over_time():
    """Get waste statistics over time"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if start_date:
        try:
            start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00')).date()
        except ValueError:
            return jsonify({'error': 'Invalid start_date format'}), 400
    else:
        # Default to 30 days ago
        start_date = datetime.utcnow().date() - timedelta(days=30)
    
    if end_date:
        try:
            end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00')).date()
        except ValueError:
            return jsonify({'error': 'Invalid end_date format'}), 400
    else:
        end_date = datetime.utcnow().date()
    
    # Generate a list of all dates in the range
    date_range = []
    current_date = start_date
    while current_date <= end_date:
        date_range.append(current_date)
        current_date += timedelta(days=1)
    
    # Query waste records for the given date range
    waste_records = WasteRecord.query.filter(
        WasteRecord.disposal_date >= start_date,
        WasteRecord.disposal_date <= end_date
    ).all()
    
    # Initialize data structure
    waste_over_time = []
    date_data = {date.isoformat(): {'total_quantity': 0, 'recyclable_quantity': 0} for date in date_range}
    
    # Populate with actual data
    for record in waste_records:
        date_str = record.disposal_date.isoformat()
        if date_str in date_data:
            date_data[date_str]['total_quantity'] += record.quantity
            if record.recyclable:
                date_data[date_str]['recyclable_quantity'] += record.quantity
    
    # Convert to list format
    for date_str, data in date_data.items():
        waste_over_time.append({
            'date': date_str,
            'total_quantity': data['total_quantity'],
            'recyclable_quantity': data['recyclable_quantity']
        })
    
    # Sort by date
    waste_over_time.sort(key=lambda x: x['date'])
    
    return jsonify(waste_over_time)

# Customer Routes
@api.route('/customers', methods=['GET'])
def get_customers():
    """Get all customers"""
    customers = Customer.query.all()
    return jsonify([customer.to_dict() for customer in customers])

@api.route('/customers/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    """Get a single customer by ID"""
    customer = Customer.query.get_or_404(customer_id)
    return jsonify(customer.to_dict())

@api.route('/customers/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    """Update an existing customer"""
    customer = Customer.query.get_or_404(customer_id)
    data = request.json
    
    customer.name = data.get('name', customer.name)
    customer.email = data.get('email', customer.email)
    customer.phone = data.get('phone', customer.phone)
    customer.notification_preference = data.get('notification_preference', customer.notification_preference)
    
    try:
        db.session.commit()
        return jsonify(customer.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api.route('/customers/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    """Delete a customer"""
    customer = Customer.query.get_or_404(customer_id)
    
    try:
        # First delete related purchase history records
        PurchaseHistory.query.filter_by(customer_id=customer_id).delete()
        
        # Then delete related discount notifications
        DiscountNotification.query.filter_by(customer_id=customer_id).delete()
        
        # Finally delete the customer
        db.session.delete(customer)
        db.session.commit()
        return jsonify({'message': 'Customer deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api.route('/customers/import', methods=['POST'])
def import_customers():
    """Import customers from CSV, JSON, or TXT file"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
        
    file = request.files['file']
    file_format = request.form.get('format', '').lower()
    
    if not file.filename:
        return jsonify({'error': 'No file selected'}), 400
        
    try:
        customers_data = []
        
        # Process CSV file
        if file_format == 'csv':
            stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
            csv_reader = csv.DictReader(stream)
            for row in csv_reader:
                customers_data.append({
                    'name': row.get('name', ''),
                    'email': row.get('email', ''),
                    'phone': row.get('phone', ''),
                    'address': row.get('address', '')
                })
                
        # Process JSON file
        elif file_format == 'json':
            content = file.read().decode('utf-8')
            json_data = json.loads(content)
            
            # Handle both array of objects and single object
            if isinstance(json_data, list):
                customers_data = json_data
            else:
                customers_data = [json_data]
                
        # Process TXT file (assuming tab or comma separated)
        elif file_format == 'txt':
            stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
            for line in stream:
                # Try to split by tab first, then by comma if not enough fields
                fields = line.strip().split('\t')
                if len(fields) < 2:
                    fields = line.strip().split(',')
                    
                if len(fields) >= 2:  # At least name and one contact method
                    customers_data.append({
                        'name': fields[0],
                        'email': fields[1] if len(fields) > 1 else '',
                        'phone': fields[2] if len(fields) > 2 else '',
                        'address': fields[3] if len(fields) > 3 else ''
                    })
        else:
            return jsonify({'error': 'Unsupported file format'}), 400
            
        # Validate and add customers to database
        added_count = 0
        errors = []
        
        for idx, customer_data in enumerate(customers_data):
            # Basic validation
            if not customer_data.get('name'):
                errors.append(f"Row {idx+1}: Name is required")
                continue
                
            # Check for duplicate email if provided
            if customer_data.get('email') and Customer.query.filter_by(email=customer_data['email']).first():
                errors.append(f"Row {idx+1}: Email {customer_data['email']} already exists")
                continue
                
            # Create new customer
            new_customer = Customer(
                name=customer_data.get('name', ''),
                email=customer_data.get('email', ''),
                phone=customer_data.get('phone', ''),
                address=customer_data.get('address', '')
            )
            
            db.session.add(new_customer)
            added_count += 1
            
        # Commit all valid customers
        if added_count > 0:
            db.session.commit()
            
        return jsonify({
            'message': f'Successfully imported {added_count} customers',
            'total': len(customers_data),
            'added': added_count,
            'errors': errors
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api.route('/customers', methods=['POST'])
def create_customer():
    """Create a new customer"""
    data = request.json
    
    customer = Customer(
        name=data.get('name'),
        email=data.get('email'),
        phone=data.get('phone'),
        notification_preference=data.get('notification_preference', NotificationType.EMAIL.value)
    )
    
    db.session.add(customer)
    
    try:
        db.session.commit()
        return jsonify(customer.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Purchase History Routes
@api.route('/purchase-history', methods=['GET'])
def get_purchase_history():
    """Get purchase history with optional filtering"""
    customer_id = request.args.get('customer_id', type=int)
    product_id = request.args.get('product_id', type=int)
    
    query = PurchaseHistory.query
    
    if customer_id:
        query = query.filter_by(customer_id=customer_id)
    
    if product_id:
        query = query.filter_by(product_id=product_id)
    
    purchases = query.all()
    return jsonify([purchase.to_dict() for purchase in purchases])

@api.route('/purchase-history', methods=['POST'])
def create_purchase():
    """Record a new purchase"""
    data = request.json
    
    # Convert string date to datetime object
    if 'purchase_date' in data:
        try:
            data['purchase_date'] = datetime.fromisoformat(data['purchase_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid purchase_date format'}), 400
    else:
        data['purchase_date'] = datetime.utcnow()
    
    purchase = PurchaseHistory(
        customer_id=data.get('customer_id'),
        product_id=data.get('product_id'),
        quantity=data.get('quantity', 1),
        purchase_date=data.get('purchase_date')
    )
    
    db.session.add(purchase)
    
    try:
        db.session.commit()
        return jsonify(purchase.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Inventory Management Routes
@api.route('/inventory/check-expiry', methods=['POST'])
def check_expiry():
    """Check for products nearing expiry and update their status"""
    updated_products = utils.check_expiring_products()
    return jsonify({
        'updated_count': len(updated_products),
        'updated_products': updated_products
    })

@api.route('/inventory/process-expired', methods=['POST'])
def process_expired():
    """Process expired products and create waste records"""
    processed_records = utils.process_expired_products()
    return jsonify({
        'processed_count': len(processed_records),
        'processed_records': processed_records
    })

@api.route('/inventory/fefo', methods=['GET'])
def get_fefo_inventory():
    """Get inventory sorted by First-Expiry-First-Out (FEFO) principle"""
    sorted_inventory = utils.sort_inventory_by_fefo()
    return jsonify(sorted_inventory)

# Notification Routes
@api.route('/notifications', methods=['GET'])
def get_notifications():
    """Get all notifications with optional filtering"""
    customer_id = request.args.get('customer_id', type=int)
    status = request.args.get('status')
    
    query = DiscountNotification.query
    
    if customer_id:
        query = query.filter_by(customer_id=customer_id)
    
    if status:
        query = query.filter_by(status=status)
    
    notifications = query.all()
    return jsonify([notification.to_dict() for notification in notifications])

@api.route('/notifications/process', methods=['POST'])
def process_notifications():
    """Process pending notifications"""
    from app import mail
    results = utils.process_pending_notifications(mail)
    return jsonify(results)
