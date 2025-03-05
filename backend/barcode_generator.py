import os
import barcode
from barcode.writer import ImageWriter
import qrcode
from datetime import datetime
import json
from io import BytesIO
import base64

class BarcodeGenerator:
    """Utility class for generating barcodes and QR codes for products"""
    
    @staticmethod
    def generate_barcode(product_data, barcode_type='code128'):
        """
        Generate a barcode for a product
        
        Args:
            product_data (dict): Product data to encode in the barcode
            barcode_type (str): Type of barcode to generate (default: code128)
            
        Returns:
            str: Base64 encoded image data
        """
        # Create barcode data
        if isinstance(product_data, dict):
            # Use barcode as the data if available, otherwise use product name
            barcode_data = product_data.get('barcode', product_data.get('name', str(datetime.now().timestamp())))
        else:
            barcode_data = str(product_data)
        
        # Ensure barcode data is valid
        barcode_data = barcode_data.replace(' ', '_').upper()
        
        # Create barcode
        barcode_class = barcode.get_barcode_class(barcode_type)
        barcode_instance = barcode_class(barcode_data, writer=ImageWriter())
        
        # Save barcode to BytesIO
        buffer = BytesIO()
        barcode_instance.write(buffer)
        
        # Convert to base64
        buffer.seek(0)
        image_data = base64.b64encode(buffer.read()).decode('utf-8')
        
        return f"data:image/png;base64,{image_data}"
    
    @staticmethod
    def generate_qr_code(product_data):
        """
        Generate a QR code for a product
        
        Args:
            product_data (dict): Product data to encode in the QR code
            
        Returns:
            str: Base64 encoded image data
        """
        # Convert product data to JSON string
        if isinstance(product_data, dict):
            qr_data = json.dumps(product_data)
        else:
            qr_data = str(product_data)
        
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save QR code to BytesIO
        buffer = BytesIO()
        img.save(buffer)
        
        # Convert to base64
        buffer.seek(0)
        image_data = base64.b64encode(buffer.read()).decode('utf-8')
        
        return f"data:image/png;base64,{image_data}"
    
    @staticmethod
    def decode_barcode(barcode_data):
        """
        Decode barcode data (placeholder for future implementation)
        
        Args:
            barcode_data (str): Barcode data to decode
            
        Returns:
            dict: Decoded product data
        """
        # In a real implementation, this would use a barcode scanning library
        # For now, we'll just return a simple representation
        return {
            'barcode': barcode_data,
            'scanned_at': datetime.now().isoformat()
        }
    
    @staticmethod
    def generate_sample_barcodes(num_samples=5):
        """
        Generate sample barcodes for demo purposes
        
        Args:
            num_samples (int): Number of sample barcodes to generate
            
        Returns:
            list: List of dictionaries containing sample product data and barcodes
        """
        samples = []
        categories = ['Dairy', 'Bakery', 'Produce', 'Meat', 'Seafood', 'Frozen Foods', 
                     'Canned Goods', 'Dry Goods', 'Beverages', 'Snacks']
        
        for i in range(num_samples):
            # Generate sample product data
            product_data = {
                'id': i + 1,
                'name': f'Sample Product {i + 1}',
                'barcode': f'SAMPLE{i+1:03d}',
                'category': categories[i % len(categories)],
                'expiry_date': (datetime.now().date()).isoformat(),
                'price': round(1.99 + i, 2)
            }
            
            # Generate barcode and QR code
            barcode_image = BarcodeGenerator.generate_barcode(product_data)
            qr_code_image = BarcodeGenerator.generate_qr_code(product_data)
            
            samples.append({
                'product_data': product_data,
                'barcode_image': barcode_image,
                'qr_code_image': qr_code_image
            })
        
        return samples
