from datetime import datetime, timedelta
from backend.models import db, Product, Category, WasteRecord, ProductStatus, WasteType
import random
import string
from flask_mail import Message

def generate_barcode(prefix='PROD'):
    """Generate a unique barcode for a product"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{prefix}{timestamp}{random_suffix}"

def check_expiring_products():
    """Check for products nearing expiry and update their status"""
    today = datetime.utcnow().date()
    products = Product.query.filter(
        Product.status == ProductStatus.ACTIVE.value
    ).all()
    
    updated_products = []
    
    for product in products:
        old_status = product.status
        new_status = product.check_expiry_status()
        
        if old_status != new_status:
            updated_products.append({
                'product': product.to_dict(),
                'old_status': old_status,
                'new_status': new_status
            })
    
    return updated_products

def process_expired_products():
    """Process expired products and create waste records"""
    today = datetime.utcnow().date()
    expired_products = Product.query.filter(
        Product.status == ProductStatus.EXPIRED.value,
        Product.expiry_date < today
    ).all()
    
    processed_records = []
    
    for product in expired_products:
        # Get category information for waste type
        category = Category.query.filter_by(name=product.category).first()
        
        if category:
            waste_type = category.waste_type
            recyclable = category.recyclable
            
            # Create waste record
            waste_record = WasteRecord(
                product_id=product.id,
                quantity=product.quantity,
                waste_type=waste_type,
                recyclable=recyclable,
                disposal_method='Recycle' if recyclable else 'Landfill',
                disposal_date=today,
                notes=f"Expired product disposed on {today.isoformat()}"
            )
            
            db.session.add(waste_record)
            
            # Update product status
            product.status = ProductStatus.DISPOSED.value
            product.quantity = 0
            
            processed_records.append({
                'product': product.to_dict(),
                'waste_record': waste_record.to_dict()
            })
    
    db.session.commit()
    return processed_records

def get_waste_statistics(start_date=None, end_date=None):
    """Get waste statistics for a given date range"""
    if not start_date:
        start_date = datetime.utcnow().date() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow().date()
    
    try:
        waste_records = WasteRecord.query.filter(
            WasteRecord.disposal_date >= start_date,
            WasteRecord.disposal_date <= end_date
        ).all()
        
        # Calculate statistics with safe defaults
        total_waste = sum(record.quantity for record in waste_records) if waste_records else 0
        recyclable_waste = sum(record.quantity for record in waste_records if record.recyclable) if waste_records else 0
        non_recyclable_waste = total_waste - recyclable_waste
        
        waste_by_type = {}
        for record in waste_records:
            waste_type = record.waste_type or 'Unspecified'
            if waste_type not in waste_by_type:
                waste_by_type[waste_type] = 0
            waste_by_type[waste_type] += record.quantity
        
        waste_by_date = {}
        for record in waste_records:
            date_str = record.disposal_date.isoformat()
            if date_str not in waste_by_date:
                waste_by_date[date_str] = 0
            waste_by_date[date_str] += record.quantity
        
        return {
            'total_waste': total_waste,
            'recyclable_waste': recyclable_waste,
            'non_recyclable_waste': non_recyclable_waste,
            'recyclable_percentage': (recyclable_waste / total_waste * 100) if total_waste > 0 else 0,
            'waste_by_type': waste_by_type,
            'waste_by_date': waste_by_date,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat()
        }
    except Exception as e:
        print(f"Error calculating waste statistics: {str(e)}")
        # Return safe default values if there's an error
        return {
            'total_waste': 0,
            'recyclable_waste': 0,
            'non_recyclable_waste': 0,
            'recyclable_percentage': 0,
            'waste_by_type': {},
            'waste_by_date': {},
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat()
        }

def sort_inventory_by_fefo():
    """Sort inventory by First-Expiry-First-Out (FEFO) principle"""
    categories = Category.query.all()
    sorted_inventory = {}
    
    for category in categories:
        products = Product.query.filter_by(
            category=category.name
        ).filter(
            Product.status.in_([ProductStatus.ACTIVE.value, ProductStatus.DISCOUNTED.value])
        ).order_by(
            Product.expiry_date.asc()
        ).all()
        
        sorted_inventory[category.name] = [product.to_dict() for product in products]
    
    return sorted_inventory

def send_discount_notification(mail, notification):
    """Send discount notification to customer"""
    from models import Customer, Product
    
    customer = Customer.query.get(notification.customer_id)
    product = Product.query.get(notification.product_id)
    
    if not customer or not product:
        return False
    
    subject = f"Discount Alert: {product.name} now at {product.discounted_price:.2f}"
    body = f"""
    Hello {customer.name},
    
    Good news! A product you've purchased before is now on discount:
    
    {product.name}
    Original Price: ${product.price:.2f}
    Discounted Price: ${product.discounted_price:.2f}
    Expiry Date: {product.expiry_date.isoformat()}
    
    Hurry and grab it before it's gone!
    
    Thank you for shopping with us.
    """
    
    try:
        msg = Message(
            subject=subject,
            recipients=[customer.email],
            body=body
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending notification: {str(e)}")
        return False

def process_pending_notifications(mail):
    """Process pending discount notifications"""
    from models import DiscountNotification, NotificationStatus
    
    pending_notifications = DiscountNotification.query.filter_by(
        status=NotificationStatus.PENDING.value
    ).all()
    
    results = {
        'total': len(pending_notifications),
        'sent': 0,
        'failed': 0
    }
    
    for notification in pending_notifications:
        success = send_discount_notification(mail, notification)
        
        if success:
            notification.status = NotificationStatus.SENT.value
            results['sent'] += 1
        else:
            notification.status = NotificationStatus.FAILED.value
            results['failed'] += 1
    
    db.session.commit()
    return results
