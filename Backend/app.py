# backend/app.py
import mysql.connector
import uuid
from flask import Flask, jsonify, request
from flask_cors import CORS

# --- MySQL Database Configuration ---
# IMPORTANT: Replace these values with your actual MySQL database credentials.
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',      # <-- Replace with your user
    'password': 'pankaj12',# <-- Replace with your password
    'database': 'expenses_db'       # <-- Replace with your database name
}

def get_db_connection():
    """Establishes a connection to the MySQL database."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to MySQL: {err}")
        return None

def init_db():
    """Initializes the database and creates the expenses table if it doesn't exist."""
    print("Checking database and table...")
    conn = get_db_connection()
    if conn is None:
        print("Could not connect to the database. Aborting initialization.")
        return

    cursor = conn.cursor()
    # Create the database if it doesn't exist
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']}")
    cursor.execute(f"USE {DB_CONFIG['database']}")
    
    # Create the table if it doesn't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id VARCHAR(36) PRIMARY KEY,
            description VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            category VARCHAR(50) NOT NULL
        )
    ''')
    conn.commit()
    cursor.close()
    conn.close()
    print("Database and table are ready.")

# --- Flask App Initialization ---
app = Flask(__name__)
CORS(app)

# --- API Endpoints ---

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    """Endpoint to retrieve all expenses from the database."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
        
    # Using a dictionary cursor to get results as a list of dicts
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM expenses')
    expenses = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(expenses)

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    """Endpoint to add a new expense to the database."""
    if not request.json or 'description' not in request.json or 'amount' not in request.json or 'category' not in request.json:
        return jsonify({"error": "Missing data"}), 400

    new_expense = {
        'id': str(uuid.uuid4()),
        'description': request.json['description'],
        'amount': float(request.json['amount']),
        'category': request.json['category']
    }

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
        
    cursor = conn.cursor()
    sql = 'INSERT INTO expenses (id, description, amount, category) VALUES (%s, %s, %s, %s)'
    val = (new_expense['id'], new_expense['description'], new_expense['amount'], new_expense['category'])
    cursor.execute(sql, val)
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify(new_expense), 201

@app.route('/api/expenses/<string:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    """Endpoint to delete an expense from the database by its ID."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
        
    cursor = conn.cursor()
    cursor.execute('DELETE FROM expenses WHERE id = %s', (expense_id,))
    conn.commit()
    
    # cursor.rowcount will be 1 if a row was deleted, 0 otherwise
    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        return jsonify({'error': 'Expense not found'}), 404
        
    cursor.close()
    conn.close()
    return jsonify({'message': 'Expense deleted successfully'}), 200

# --- Main execution ---
if __name__ == '__main__':
    print("--- Starting Expense Tracker Backend (MySQL) ---")
    init_db()
    print(f"Starting Flask server at http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
