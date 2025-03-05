from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_mail import Mail
import os
from backend.models import db
from backend.routes import api
from backend import utils
import threading
import time
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)

logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__, static_folder='../frontend/build')
CORS(app)

# Configure app
import os
base_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(base_dir, "database/waste_management.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure mail
app.config['MAIL_SERVER'] = 'smtp.example.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'your-email@example.com'
app.config['MAIL_PASSWORD'] = 'your-password'
app.config['MAIL_DEFAULT_SENDER'] = 'your-email@example.com'

# Initialize extensions
db.init_app(app)
mail = Mail(app)

# Register blueprints
app.register_blueprint(api, url_prefix='/api')

# Background tasks
def run_scheduled_tasks():
    """Run scheduled tasks in the background"""
    with app.app_context():
        while True:
            try:
                logger.info("Running scheduled tasks...")
                
                # Check for expiring products
                updated_products = utils.check_expiring_products()
                if updated_products:
                    logger.info(f"Updated {len(updated_products)} expiring products")
                
                # Process expired products
                processed_records = utils.process_expired_products()
                if processed_records:
                    logger.info(f"Processed {len(processed_records)} expired products")
                
                # Process pending notifications
                notification_results = utils.process_pending_notifications(mail)
                if notification_results['sent'] > 0 or notification_results['failed'] > 0:
                    logger.info(f"Processed notifications: {notification_results}")
                
                logger.info("Scheduled tasks completed")
            except Exception as e:
                logger.error(f"Error in scheduled tasks: {str(e)}")
            
            # Sleep for 1 hour
            time.sleep(3600)

# Serve frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Server error"}), 500

if __name__ == '__main__':
    # Create database tables
    with app.app_context():
        db.create_all()
    
    # Start background task thread
    scheduler_thread = threading.Thread(target=run_scheduled_tasks)
    scheduler_thread.daemon = True
    scheduler_thread.start()
    
    # Run the app on port 5001
    app.run(debug=True, host='0.0.0.0', port=5001)
