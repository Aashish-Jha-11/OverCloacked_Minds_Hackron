from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import enum

db = SQLAlchemy()

class ProductStatus(enum.Enum):
    ACTIVE = "active"
    DISCOUNTED = "discounted"
    EXPIRED = "expired"
    DISPOSED = "disposed"

class WasteType(enum.Enum):
    ORGANIC = "Organic"
    RECYCLABLE = "Recyclable"
    NON_RECYCLABLE = "Non-recyclable"
    MIXED = "Mixed"

class NotificationType(enum.Enum):
    EMAIL = "email"
    SMS = "sms"
    BOTH = "both"

class NotificationStatus(enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    barcode = db.Column(db.String(50), unique=True, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    expiry_date = db.Column(db.Date, nullable=False)
    manufacture_date = db.Column(db.Date, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit = db.Column(db.String(20), nullable=False)
    price = db.Column(db.Float, nullable=False)
    discounted_price = db.Column(db.Float)
    location = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default=ProductStatus.ACTIVE.value)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    waste_records = db.relationship('WasteRecord', backref='product', lazy=True)
    purchase_history = db.relationship('PurchaseHistory', backref='product', lazy=True)
    discount_notifications = db.relationship('DiscountNotification', backref='product', lazy=True)
    
    def __repr__(self):
        return f'<Product {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'barcode': self.barcode,
            'category': self.category,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'manufacture_date': self.manufacture_date.isoformat() if self.manufacture_date else None,
            'quantity': self.quantity,
            'unit': self.unit,
            'price': self.price,
            'discounted_price': self.discounted_price,
            'location': self.location,
            'status': self.status,
            'days_until_expiry': (self.expiry_date - datetime.utcnow().date()).days if self.expiry_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def check_expiry_status(self):
        """Check and update product status based on expiry date"""
        today = datetime.utcnow().date()
        days_until_expiry = (self.expiry_date - today).days
        
        # Get category to determine discount threshold
        category = Category.query.filter_by(name=self.category).first()
        discount_threshold = category.discount_threshold if category else 7
        
        if days_until_expiry <= 0:
            self.status = ProductStatus.EXPIRED.value
        elif days_until_expiry <= discount_threshold and self.status == ProductStatus.ACTIVE.value:
            # Apply discount based on category and days until expiry
            # Calculate discount percentage proportionally to how close to expiry
            # The closer to expiry, the higher the discount
            days_left_percentage = days_until_expiry / discount_threshold
            base_discount = 30  # Starting discount percentage
            max_discount = 70   # Maximum discount percentage
            
            # Progressive discount: increases as expiry date approaches
            # At threshold days: minimal discount, At 0 days: maximum discount
            discount_percentage = base_discount + (max_discount - base_discount) * (1 - days_left_percentage)
            discount_percentage = round(discount_percentage, 0)  # Round to nearest integer percentage
            
            self.discounted_price = round(self.price * (1 - discount_percentage / 100), 2)
            self.status = ProductStatus.DISCOUNTED.value
            
            # Notify customers who previously purchased this product
            self.notify_customers()
        
        db.session.commit()
        return self.status
    
    def notify_customers(self):
        """Notify customers who previously purchased this product about the discount"""
        # Find customers who purchased this product
        customer_purchases = PurchaseHistory.query.filter_by(product_id=self.id).all()
        customer_ids = set(purchase.customer_id for purchase in customer_purchases)
        
        for customer_id in customer_ids:
            # Check if notification already exists
            existing_notification = DiscountNotification.query.filter_by(
                customer_id=customer_id,
                product_id=self.id,
                status=NotificationStatus.PENDING.value
            ).first()
            
            if not existing_notification:
                notification = DiscountNotification(
                    customer_id=customer_id,
                    product_id=self.id,
                    notification_date=datetime.utcnow().date(),
                    notification_type=Customer.query.get(customer_id).notification_preference,
                    status=NotificationStatus.PENDING.value
                )
                db.session.add(notification)
        
        db.session.commit()

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200))
    waste_type = db.Column(db.String(20), nullable=False)
    recyclable = db.Column(db.Boolean, default=False)
    discount_threshold = db.Column(db.Integer, default=7)  # Days before expiry to apply discount
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Category {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'waste_type': self.waste_type,
            'recyclable': self.recyclable,
            'discount_threshold': self.discount_threshold,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class WasteRecord(db.Model):
    __tablename__ = 'waste_records'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    waste_type = db.Column(db.String(20), nullable=False)
    recyclable = db.Column(db.Boolean, nullable=False)
    disposal_method = db.Column(db.String(50), nullable=False)
    disposal_date = db.Column(db.Date, nullable=False)
    notes = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<WasteRecord {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else None,
            'quantity': self.quantity,
            'waste_type': self.waste_type,
            'recyclable': self.recyclable,
            'disposal_method': self.disposal_method,
            'disposal_date': self.disposal_date.isoformat() if self.disposal_date else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), unique=True)
    notification_preference = db.Column(db.String(10), default=NotificationType.EMAIL.value)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    purchase_history = db.relationship('PurchaseHistory', backref='customer', lazy=True)
    discount_notifications = db.relationship('DiscountNotification', backref='customer', lazy=True)
    
    def __repr__(self):
        return f'<Customer {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'notification_preference': self.notification_preference,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class PurchaseHistory(db.Model):
    __tablename__ = 'purchase_history'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    purchase_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<PurchaseHistory {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'customer_name': self.customer.name if self.customer else None,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else None,
            'quantity': self.quantity,
            'purchase_date': self.purchase_date.isoformat() if self.purchase_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class DiscountNotification(db.Model):
    __tablename__ = 'discount_notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    notification_date = db.Column(db.Date, nullable=False)
    notification_type = db.Column(db.String(10), nullable=False)
    status = db.Column(db.String(10), default=NotificationStatus.PENDING.value)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<DiscountNotification {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'customer_name': self.customer.name if self.customer else None,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else None,
            'notification_date': self.notification_date.isoformat() if self.notification_date else None,
            'notification_type': self.notification_type,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
