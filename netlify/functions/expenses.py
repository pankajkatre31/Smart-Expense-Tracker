# netlify/functions/expenses.py
import os
import json
import mysql.connector
import uuid

# --- Database Connection ---
def get_db_connection():
    """Establishes a connection to the MySQL database using environment variables."""
    try:
        # These are read from the Netlify UI Environment Variables you set in Step 1
        conn = mysql.connector.connect(
            host=os.environ.get('DB_HOST'),
            user=os.environ.get('DB_USER'),
            password=os.environ.get('DB_PASSWORD'),
            database=os.environ.get('DB_NAME')
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to MySQL: {err}")
        return None

# --- Main Handler Function ---
def handler(event, context):
    """
    This is the main entry point for the Netlify Function.
    It routes requests based on the HTTP method.
    """
    http_method = event['httpMethod']

    if http_method == 'GET':
        return get_expenses()
    elif http_method == 'POST':
        return add_expense(event)
    elif http_method == 'DELETE':
        return delete_expense(event)
    
    return {
        'statusCode': 405,
        'body': json.dumps({'error': 'Method Not Allowed'})
    }

# --- Logic Functions (from your original app.py) ---

def get_expenses():
    """Handles GET requests to retrieve all expenses."""
    conn = get_db_connection()
    if not conn:
        return {'statusCode': 500, 'body': json.dumps({"error": "Database connection failed"})}
        
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM expenses')
    expenses = cursor.fetchall()
    
    # Convert Decimal types to strings for JSON serialization
    for expense in expenses:
        if 'amount' in expense:
            expense['amount'] = str(expense['amount'])
            
    cursor.close()
    conn.close()
    return {'statusCode': 200, 'body': json.dumps(expenses)}

def add_expense(event):
    """Handles POST requests to add a new expense."""
    try:
        body = json.loads(event['body'])
    except:
        return {'statusCode': 400, 'body': json.dumps({"error": "Invalid JSON"})}

    if 'description' not in body or 'amount' not in body or 'category' not in body:
        return {'statusCode': 400, 'body': json.dumps({"error": "Missing data"})}

    new_expense = {
        'id': str(uuid.uuid4()),
        'description': body['description'],
        'amount': float(body['amount']),
        'category': body['category']
    }

    conn = get_db_connection()
    if not conn:
        return {'statusCode': 500, 'body': json.dumps({"error": "Database connection failed"})}
        
    cursor = conn.cursor()
    sql = 'INSERT INTO expenses (id, description, amount, category) VALUES (%s, %s, %s, %s)'
    val = (new_expense['id'], new_expense['description'], new_expense['amount'], new_expense['category'])
    cursor.execute(sql, val)
    conn.commit()
    cursor.close()
    conn.close()
    
    return {'statusCode': 201, 'body': json.dumps(new_expense)}

def delete_expense(event):
    """Handles DELETE requests to remove an expense."""
    # Extract ID from path: /.netlify/functions/expenses/some-id
    try:
        path_parts = event['path'].strip('/').split('/')
        expense_id = path_parts[-1]
    except IndexError:
        return {'statusCode': 400, 'body': json.dumps({'error': 'Expense ID missing in URL'})}

    conn = get_db_connection()
    if not conn:
        return {'statusCode': 500, 'body': json.dumps({"error": "Database connection failed"})}
        
    cursor = conn.cursor()
    cursor.execute('DELETE FROM expenses WHERE id = %s', (expense_id,))
    conn.commit()
    
    rowcount = cursor.rowcount
    cursor.close()
    conn.close()
    
    if rowcount == 0:
        return {'statusCode': 404, 'body': json.dumps({'error': 'Expense not found'})}
        
    return {'statusCode': 200, 'body': json.dumps({'message': 'Expense deleted successfully'})}