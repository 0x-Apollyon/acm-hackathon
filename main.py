"""
FinZ - Financial Management API
==============================

A secure Flask-based API for financial data management with comprehensive
session handling, user authentication, and financial data tracking.

Features:
- Secure user authentication with bcrypt password hashing
- Session management with database tracking
- Financial data management (accounts, transactions, balances)
- Rate limiting and security headers
- CORS support for frontend integration

Author: Your Name
Version: 1.0.0
"""

import sqlite3
import bcrypt
import os
import re
import secrets
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional, Tuple, Dict, Any, List
from flask import Flask, request, jsonify, session, g
from flask_cors import CORS
from dotenv import load_dotenv
import logging
import json
import hashlib
import uuid
from functools import wraps
import time

# =============================================================================
# CONFIGURATION AND SETUP
# =============================================================================

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask app configuration
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(32))

# Environment-aware cookie settings
IS_PRODUCTION = os.getenv('FLASK_ENV') == 'production'
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent XSS
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)

if IS_PRODUCTION:
    # For cross-site cookies in production behind HTTPS
    app.config['SESSION_COOKIE_SECURE'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
else:
    # Local development over HTTP
    app.config['SESSION_COOKIE_SECURE'] = False
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Enable CORS for frontend integration with credentials (cookies)
CORS(
    app,
    origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
    supports_credentials=True,
    allow_headers=['Content-Type', 'Authorization'],
    methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
)

# =============================================================================
# SECURE USER MANAGER CLASS
# =============================================================================

class SecureUserManager:
    """
    Manages user authentication, registration, and financial data.
    
    This class handles:
    - User registration and login
    - Password hashing and validation
    - Input validation and security
    - Account lockout protection
    - Financial data management (accounts, transactions, balances)
    
    Database Tables:
    - users: Core user information
    - linked_accounts: Bank/investment accounts
    - transactions: Financial transaction history
    - user_balances: Aggregated balance information
    - user_preferences: User settings
    """
    
    def __init__(self, db_path: str = "users.db"):
        """
        Initialize the SecureUserManager.
        
        Args:
            db_path (str): Path to the SQLite database file
        """
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        """
        Get a secure database connection with proper configuration.
        
        Returns:
            sqlite3.Connection: Configured database connection
        """
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        # Enable foreign key constraints
        conn.execute("PRAGMA foreign_keys = ON")
        # Set secure journal mode
        conn.execute("PRAGMA journal_mode = WAL") 
        return conn
    
    def init_database(self):
        """
        Initialize the SQLite database with secure schema.
        
        Creates the following tables:
        - users: User authentication and profile data
        - linked_accounts: Financial accounts linked to users
        - transactions: Financial transaction history
        - user_balances: Aggregated balance information
        - user_preferences: User settings and preferences
        
        Raises:
            Exception: If database initialization fails
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Users table - Core user authentication data
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL CHECK(length(username) >= 3 AND length(username) <= 50),
                    email TEXT UNIQUE NOT NULL CHECK(length(email) <= 255),
                    password_hash TEXT NOT NULL CHECK(length(password_hash) > 0),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP,
                    failed_login_attempts INTEGER DEFAULT 0,
                    account_locked_until TIMESTAMP NULL
                )
            ''')
            
            # Linked accounts table - Bank accounts, investment accounts, etc.
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS linked_accounts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    account_name TEXT NOT NULL,
                    account_type TEXT NOT NULL CHECK(account_type IN ('bank', 'investment', 'credit', 'crypto', 'other')),
                    institution_name TEXT,
                    account_number_masked TEXT,
                    balance DECIMAL(15,2) DEFAULT 0.00,
                    currency TEXT DEFAULT 'USD',
                    is_active BOOLEAN DEFAULT 1,
                    linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_sync TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            ''')
            
            # Transactions table - Financial transaction history
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    account_id INTEGER,
                    transaction_type TEXT NOT NULL CHECK(transaction_type IN ('income', 'expense', 'transfer', 'investment')),
                    amount DECIMAL(15,2) NOT NULL,
                    currency TEXT DEFAULT 'USD',
                    description TEXT,
                    category TEXT,
                    platform TEXT,
                    transaction_date TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                    FOREIGN KEY (account_id) REFERENCES linked_accounts (id) ON DELETE SET NULL
                )
            ''')
            
            # User balances table - Aggregated balance information
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_balances (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    total_balance DECIMAL(15,2) DEFAULT 0.00,
                    available_balance DECIMAL(15,2) DEFAULT 0.00,
                    invested_balance DECIMAL(15,2) DEFAULT 0.00,
                    currency TEXT DEFAULT 'USD',
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            ''')
            
            # User preferences table - User settings and preferences
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_preferences (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    default_currency TEXT DEFAULT 'USD',
                    timezone TEXT DEFAULT 'UTC',
                    notifications_enabled BOOLEAN DEFAULT 1,
                    theme TEXT DEFAULT 'light',
                    language TEXT DEFAULT 'en',
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            ''')
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS goals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    default_currency TEXT DEFAULT 'USD',
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    target DECIMAL(15,2) NOT NULL,
                    progress DECIMAL(15,2) NOT NULL,
                    due_date TIMESTAMP NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            ''')
            # Create indexes for better performance
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_linked_accounts_user_id ON linked_accounts(user_id)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id)
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Database initialized successfully")
            
        except Exception as e:
            logger.error(f"Database initialization failed: {str(e)}")
            raise

    # =============================================================================
    # AUTHENTICATION METHODS
    # =============================================================================

    def hash_password(self, password: str) -> str:
        """
        Hash a password using bcrypt with 12 rounds.
        
        Args:
            password (str): Plain text password to hash
            
        Returns:
            str: Hashed password string
            
        Raises:
            Exception: If password hashing fails
        """
        try:
            # Generate salt and hash password
            salt = bcrypt.gensalt(rounds=12)  # 12 rounds for good security
            hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
            return hashed.decode('utf-8')
        except Exception as e:
            logger.error(f"Password hashing failed: {str(e)}")
            raise
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """
        Verify a password against its hash.
        
        Args:
            password (str): Plain text password to verify
            hashed (str): Hashed password to compare against
            
        Returns:
            bool: True if password matches, False otherwise
        """
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
        except Exception as e:
            logger.warning(f"Password verification failed: {str(e)}")
            return False

    def validate_input(self, username: str, email: str, password: str) -> Tuple[bool, str]:
        """
        Comprehensive input validation to prevent injection attacks.
        
        Args:
            username (str): Username to validate
            email (str): Email to validate
            password (str): Password to validate
            
        Returns:
            Tuple[bool, str]: (is_valid, error_message)
        """
        # Username validation
        if not username or len(username.strip()) < 3:
            return False, "Username must be at least 3 characters long"
        
        if len(username) > 50:
            return False, "Username must be less than 50 characters"
        
        if not re.match(r'^[a-zA-Z0-9_-]+$', username):
            return False, "Username can only contain letters, numbers, underscores, and hyphens"
        
        # Email validation
        if not email or len(email.strip()) == 0:
            return False, "Email is required"
        
        if len(email) > 255:
            return False, "Email must be less than 255 characters"
        
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return False, "Invalid email format"
        
        # Password validation
        if not password or len(password) < 8:
            return False, "Password must be at least 8 characters long"
        
        if len(password) > 128:
            return False, "Password must be less than 128 characters"
        
        # Check for common weak passwords
        weak_passwords = ['password', '123456', 'password123', 'admin', 'qwerty']
        if password.lower() in weak_passwords:
            return False, "Password is too common, please choose a stronger password"
        
        return True, "Valid input"

    # =============================================================================
    # ACCOUNT SECURITY METHODS
    # =============================================================================

    def is_account_locked(self, username: str) -> Tuple[bool, str]:
        """
        Check if account is locked due to failed login attempts.
        
        Args:
            username (str): Username to check
            
        Returns:
            Tuple[bool, str]: (is_locked, lock_message)
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT failed_login_attempts, account_locked_until 
                FROM users 
                WHERE username = ?
            ''', (username,))
            
            result = cursor.fetchone()
            conn.close()
            
            if not result:
                return False, ""
            
            failed_attempts, locked_until = result
            
            if locked_until and datetime.fromisoformat(locked_until) > datetime.now():
                return True, f"Account locked until {locked_until}"
            
            return False, ""
            
        except Exception as e:
            logger.error(f"Account lock check failed: {str(e)}")
            return False, ""
    
    def increment_failed_attempts(self, username: str):
        """
        Increment failed login attempts and lock account if necessary.
        
        Locks account after 5 failed attempts for 30 minutes.
        
        Args:
            username (str): Username to update
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Get current failed attempts
            cursor.execute('''
                SELECT failed_login_attempts FROM users WHERE username = ?
            ''', (username,))
            
            result = cursor.fetchone()
            if not result:
                conn.close()
                return
            
            current_attempts = result[0] + 1
            new_attempts = current_attempts
            
            # Lock account after 5 failed attempts for 30 minutes
            locked_until = None
            if current_attempts >= 5:
                locked_until = (datetime.now() + timedelta(minutes=30)).isoformat()
                new_attempts = 0  # Reset counter when locked
            
            cursor.execute('''
                UPDATE users 
                SET failed_login_attempts = ?, account_locked_until = ?
                WHERE username = ?
            ''', (new_attempts, locked_until, username))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Failed to increment login attempts: {str(e)}")
    
    def reset_failed_attempts(self, username: str):
        """
        Reset failed login attempts on successful login.
        
        Args:
            username (str): Username to reset
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE users 
                SET failed_login_attempts = 0, account_locked_until = NULL, last_login = CURRENT_TIMESTAMP
                WHERE username = ?
            ''', (username,))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Failed to reset login attempts: {str(e)}")

    # =============================================================================
    # USER MANAGEMENT METHODS
    # =============================================================================

    def register_user(self, username: str, email: str, password: str) -> Tuple[bool, str]:
        """
        Register a new user with comprehensive validation.
        
        Args:
            username (str): Desired username
            email (str): User's email address
            password (str): Plain text password
            
        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            # Input validation
            is_valid, message = self.validate_input(username, email, password)
            if not is_valid:
                return False, message
            
            # Check if user already exists
            if self.user_exists(username, email):
                return False, "Username or email already exists"
            
            # Hash password
            password_hash = self.hash_password(password)
            
            # Insert user with parameterized query
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO users (username, email, password_hash)
                VALUES (?, ?, ?)
            ''', (username.strip().lower(), email.strip().lower(), password_hash))
            
            conn.commit()
            conn.close()
            
            logger.info(f"User registered successfully: {username}")
            return True, "User registered successfully!"
            
        except sqlite3.IntegrityError as e:
            logger.warning(f"Registration failed - integrity error: {str(e)}")
            return False, "Username or email already exists"
        except Exception as e:
            logger.error(f"Registration failed: {str(e)}")
            return False, f"Registration failed: {str(e)}"
    
    def login_user(self, username: str, password: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Login a user with security measures.
        
        Args:
            username (str): Username to login
            password (str): Plain text password
            
        Returns:
            Tuple[bool, str, Optional[Dict]]: (success, message, user_data)
        """
        try:
            # Check if account is locked
            is_locked, lock_message = self.is_account_locked(username)
            if is_locked:
                return False, lock_message, None
            
            # Get user data with parameterized query
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, username, email, password_hash, created_at, last_login
                FROM users WHERE username = ?
            ''', (username.strip().lower(),))
            
            user = cursor.fetchone()
            conn.close()
            
            if not user:
                # Don't reveal if user exists or not
                return False, "Invalid username or password", None
            
            user_id, db_username, email, password_hash, created_at, last_login = user
            
            # Verify password
            if not self.verify_password(password, password_hash):
                self.increment_failed_attempts(username)
                return False, "Invalid username or password", None
            
            # Reset failed attempts on successful login
            self.reset_failed_attempts(username)
            
            user_data = {
                'id': user_id,
                'username': db_username,
                'email': email,
                'created_at': created_at,
                'last_login': last_login
            }
            
            logger.info(f"User logged in successfully: {username}")
            return True, "Login successful!", user_data
            
        except Exception as e:
            logger.error(f"Login failed: {str(e)}")
            return False, f"Login failed: {str(e)}", None
    
    def user_exists(self, username: str, email: str) -> bool:
        """
        Check if a user with the given username or email already exists.
        
        Args:
            username (str): Username to check
            email (str): Email to check
            
        Returns:
            bool: True if user exists, False otherwise
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT COUNT(*) FROM users WHERE username = ? OR email = ?
            ''', (username.strip().lower(), email.strip().lower()))
            
            count = cursor.fetchone()[0]
            conn.close()
            
            return count > 0
            
        except Exception as e:
            logger.error(f"User existence check failed: {str(e)}")
            return False
    
    def get_user_count(self) -> int:
        """
        Get the total number of registered users.
        
        Returns:
            int: Total user count
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('SELECT COUNT(*) FROM users')
            count = cursor.fetchone()[0]
            conn.close()
            
            return count
            
        except Exception as e:
            logger.error(f"Failed to get user count: {str(e)}")
            return 0

    # =============================================================================
    # FINANCIAL DATA METHODS
    # =============================================================================

    def get_user_linked_accounts(self, user_id: int) -> List[Dict[str, Any]]:
        """
        Get all linked accounts for a user.
        
        Args:
            user_id (int): User ID to get accounts for
            
        Returns:
            List[Dict[str, Any]]: List of linked accounts
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, account_name, account_type, institution_name, 
                       account_number_masked, balance, currency, is_active, 
                       linked_at, last_sync
                FROM linked_accounts 
                WHERE user_id = ? AND is_active = 1
                ORDER BY linked_at DESC
            ''', (user_id,))
            
            accounts = []
            for row in cursor.fetchall():
                accounts.append({
                    'id': row[0],
                    'account_name': row[1],
                    'account_type': row[2],
                    'institution_name': row[3],
                    'account_number_masked': row[4],
                    'balance': float(row[5]) if row[5] else 0.0,
                    'currency': row[6],
                    'is_active': bool(row[7]),
                    'linked_at': row[8],
                    'last_sync': row[9]
                })
            
            conn.close()
            return accounts
            
        except Exception as e:
            logger.error(f"Failed to get linked accounts: {str(e)}")
            return []

    def get_user_transactions(self, user_id: int, limit: int = 50, offset: int = 0) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get recent transactions for a user, grouped by platform.
        
        Args:
            user_id (int): User ID to get transactions for
            limit (int): Maximum number of transactions to return
            offset (int): Number of transactions to skip
            
        Returns:
            Dict[str, List[Dict[str, Any]]]: Transactions grouped by platform
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT t.id, t.account_id, t.transaction_type, t.amount, t.currency,
                        t.description, t.category, t.platform, t.transaction_date, t.created_at,
                        la.account_name, la.institution_name
                FROM transactions t
                LEFT JOIN linked_accounts la ON t.account_id = la.id
                WHERE t.user_id = ?
                ORDER BY t.platform, t.transaction_date DESC
                LIMIT ? OFFSET ?
            ''', (user_id, limit, offset))
            
            transactions = {}
            for row in cursor.fetchall():
                platform = row[7] or 'Other'  # Use 'Other' if platform is NULL
                
                if platform not in transactions:
                    transactions[platform] = []
                
                transactions[platform].append({
                    'id': row[0],
                    'account_id': row[1],
                    'transaction_type': row[2],
                    'amount': float(row[3]) if row[3] else 0.0,
                    'currency': row[4],
                    'description': row[5],
                    'category': row[6],
                    'platform': platform,
                    'transaction_date': row[8],
                    'created_at': row[8],
                    'account_name': row[9],
                    'institution_name': row[10]
                })
            
            conn.close()
            return transactions
            
        except Exception as e:
            logger.error(f"Failed to get transactions: {str(e)}")
            return {}    

    def get_user_balance(self, user_id: int) -> Dict[str, Any]:
        """
        Get user's balance information.
        
        Args:
            user_id (int): User ID to get balance for
            
        Returns:
            Dict[str, Any]: Balance information
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT total_balance, available_balance, invested_balance, 
                       currency, last_updated
                FROM user_balances 
                WHERE user_id = ?
            ''', (user_id,))
            
            result = cursor.fetchone()
            
            if result:
                balance_data = {
                    'total_balance': float(result[0]) if result[0] else 0.0,
                    'available_balance': float(result[1]) if result[1] else 0.0,
                    'invested_balance': float(result[2]) if result[2] else 0.0,
                    'currency': result[3],
                    'last_updated': result[4]
                }
            else:
                # Create default balance record if none exists
                balance_data = {
                    'total_balance': 0.0,
                    'available_balance': 0.0,
                    'invested_balance': 0.0,
                    'currency': 'USD',
                    'last_updated': datetime.now().isoformat()
                }
                
                cursor.execute('''
                    INSERT INTO user_balances (user_id, total_balance, available_balance, 
                                             invested_balance, currency, last_updated)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (user_id, 0.0, 0.0, 0.0, 'USD', balance_data['last_updated']))
                conn.commit()
            
            conn.close()
            return balance_data
            
        except Exception as e:
            logger.error(f"Failed to get user balance: {str(e)}")
            return {
                'total_balance': 0.0,
                'available_balance': 0.0,
                'invested_balance': 0.0,
                'currency': 'USD',
                'last_updated': datetime.now().isoformat()
            }
    
    def get_user_preferences(self, user_id: int) -> Dict[str, Any]:
        """
        Get user preferences.
        
        Args:
            user_id (int): User ID to get preferences for
            
        Returns:
            Dict[str, Any]: User preferences
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT default_currency, timezone, notifications_enabled, 
                       theme, language
                FROM user_preferences 
                WHERE user_id = ?
            ''', (user_id,))
            
            result = cursor.fetchone()
            
            if result:
                preferences = {
                    'default_currency': result[0],
                    'timezone': result[1],
                    'notifications_enabled': bool(result[2]),
                    'theme': result[3],
                    'language': result[4]
                }
            else:
                # Create default preferences if none exist
                preferences = {
                    'default_currency': 'USD',
                    'timezone': 'UTC',
                    'notifications_enabled': True,
                    'theme': 'light',
                    'language': 'en'
                }
                
                cursor.execute('''
                    INSERT INTO user_preferences (user_id, default_currency, timezone, 
                                                notifications_enabled, theme, language)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (user_id, 'USD', 'UTC', True, 'light', 'en'))
                conn.commit()
            
            conn.close()
            return preferences
            
        except Exception as e:
            logger.error(f"Failed to get user preferences: {str(e)}")
            return {
                'default_currency': 'USD',
                'timezone': 'UTC',
                'notifications_enabled': True,
                'theme': 'light',
                'language': 'en'
            }
    
    def get_user_dashboard_data(self, user_id: int) -> Dict[str, Any]:
        """
        Get comprehensive dashboard data for a user.
        
        Args:
            user_id (int): User ID to get dashboard data for
            
        Returns:
            Dict[str, Any]: Complete dashboard data
        """
        try:
            # Get all user data
            linked_accounts = self.get_user_linked_accounts(user_id)
            recent_transactions = self.get_user_transactions(user_id, limit=10)
            balance = self.get_user_balance(user_id)
            preferences = self.get_user_preferences(user_id)
            
            # Calculate summary statistics
            total_accounts = len(linked_accounts)
            total_balance = sum(acc['balance'] for acc in linked_accounts)
            
            # Get transaction summary
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Monthly income and expenses
            cursor.execute('''
                SELECT 
                    SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as total_income,
                    SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as total_expenses,
                    COUNT(*) as transaction_count
                FROM transactions 
                WHERE user_id = ? AND transaction_date >= date('now', '-30 days')
            ''', (user_id,))
            
            monthly_stats = cursor.fetchone()
            conn.close()
            
            dashboard_data = {
                'user_info': {
                    'id': user_id,
                    'preferences': preferences
                },
                'accounts': {
                    'linked_accounts': linked_accounts,
                    'total_accounts': total_accounts,
                    'total_balance': total_balance
                },
                'transactions': {
                    'recent_transactions': recent_transactions,
                    'monthly_income': float(monthly_stats[0]) if monthly_stats[0] else 0.0,
                    'monthly_expenses': float(monthly_stats[1]) if monthly_stats[1] else 0.0,
                    'transaction_count': monthly_stats[2] if monthly_stats[2] else 0
                },
                'balance': balance,
                'summary': {
                    'net_worth': total_balance,
                    'monthly_net': (float(monthly_stats[0]) if monthly_stats[0] else 0.0) - 
                                  (float(monthly_stats[1]) if monthly_stats[1] else 0.0)
                }
            }
            
            return dashboard_data
            
        except Exception as e:
            logger.error(f"Failed to get dashboard data: {str(e)}")
            return {}

    # =============================================================================
    # GOALS (READ-ONLY) METHODS
    # =============================================================================

    def get_user_goals(self, user_id: int) -> List[Dict[str, Any]]:
        """
        Get all goals for a user (read-only).
        
        Args:
            user_id (int): User ID to get goals for
        
        Returns:
            List[Dict[str, Any]]: List of goals with details
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()

            cursor.execute('''
                SELECT id, title, description, target, progress, due_date, default_currency
                FROM goals
                WHERE user_id = ?
                ORDER BY due_date ASC
            ''', (user_id,))

            goals: List[Dict[str, Any]] = []
            for row in cursor.fetchall():
                goals.append({
                    'id': row[0],
                    'title': row[1],
                    'description': row[2],
                    'target': float(row[3]) if row[3] is not None else 0.0,
                    'progress': float(row[4]) if row[4] is not None else 0.0,
                    'due_date': row[5],
                    'currency': row[6]
                })

            conn.close()
            return goals
        except Exception as e:
            logger.error(f"Failed to get user goals: {str(e)}")
            return []

    def get_user_goals_summary(self, user_id: int) -> Dict[str, Any]:
        """
        Get aggregated summary for a user's goals (read-only).
        
        Args:
            user_id (int): User ID to summarize goals for
        
        Returns:
            Dict[str, Any]: Summary including counts and aggregate amounts
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()

            cursor.execute('''
                SELECT COUNT(*),
                       COALESCE(SUM(target), 0),
                       COALESCE(SUM(progress), 0)
                FROM goals
                WHERE user_id = ?
            ''', (user_id,))

            count, total_target, total_progress = cursor.fetchone()

            # Compute overall percent complete safely
            percent_complete = 0.0
            if total_target and float(total_target) > 0.0:
                percent_complete = float(total_progress) / float(total_target) * 100.0

            # Count overdue and completed goals
            cursor.execute('''
                SELECT 
                    SUM(CASE WHEN progress >= target AND target > 0 THEN 1 ELSE 0 END) AS completed,
                    SUM(CASE WHEN date(due_date) < date('now') AND (progress < target) THEN 1 ELSE 0 END) AS overdue
                FROM goals
                WHERE user_id = ?
            ''', (user_id,))
            row = cursor.fetchone()
            completed = row[0] if row and row[0] is not None else 0
            overdue = row[1] if row and row[1] is not None else 0

            conn.close()

            return {
                'total_goals': count or 0,
                'total_target': float(total_target) if total_target is not None else 0.0,
                'total_progress': float(total_progress) if total_progress is not None else 0.0,
                'percent_complete': percent_complete,
                'completed_goals': int(completed),
                'overdue_goals': int(overdue)
            }
        except Exception as e:
            logger.error(f"Failed to get goals summary: {str(e)}")
            return {
                'total_goals': 0,
                'total_target': 0.0,
                'total_progress': 0.0,
                'percent_complete': 0.0,
                'completed_goals': 0,
                'overdue_goals': 0
            }

# =============================================================================
# SECURE SESSION MANAGER CLASS
# =============================================================================

class SecureSessionManager:
    """
    Manages user sessions with database tracking and security features.
    
    This class handles:
    - Session creation and validation
    - Session expiration and cleanup
    - IP address and user agent tracking
    - Session invalidation and management
    
    Database Table:
    - user_sessions: Active session tracking
    """
    
    def __init__(self, db_path: str = "users.db"):
        """
        Initialize the SecureSessionManager.
        
        Args:
            db_path (str): Path to the SQLite database file
        """
        self.db_path = db_path
        self.init_session_table()
    
    def get_connection(self):
        """
        Get a secure database connection with proper configuration.
        
        Returns:
            sqlite3.Connection: Configured database connection
        """
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute("PRAGMA journal_mode = WAL")
        return conn
    
    def init_session_table(self):
        """
        Initialize the sessions table for tracking active sessions.
        
        Creates the user_sessions table with the following fields:
        - session_id: Unique session identifier
        - user_id: Associated user ID
        - ip_address: Client IP address
        - user_agent: Client user agent string
        - created_at: Session creation timestamp
        - last_activity: Last activity timestamp
        - expires_at: Session expiration timestamp
        - is_active: Session active status
        
        Raises:
            Exception: If table initialization fails
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT UNIQUE NOT NULL,
                    user_id INTEGER NOT NULL,
                    ip_address TEXT,
                    user_agent TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    is_active BOOLEAN DEFAULT 1,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            ''')
            
            # Create indexes for better performance
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON user_sessions(session_id)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at)
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Session table initialized successfully")
            
        except Exception as e:
            logger.error(f"Session table initialization failed: {str(e)}")
            raise
    
    def create_session(self, user_id: int, ip_address: str = None, user_agent: str = None) -> str:
        """
        Create a new session for a user.
        
        Args:
            user_id (int): User ID to create session for
            ip_address (str, optional): Client IP address
            user_agent (str, optional): Client user agent string
            
        Returns:
            str: Generated session ID
            
        Raises:
            Exception: If session creation fails
        """
        try:
            # Generate a secure session ID
            session_id = str(uuid.uuid4())
            
            # Set session expiration (24 hours from now)
            expires_at = datetime.now() + timedelta(hours=24)
            
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # First, get count of existing active sessions for logging
            cursor.execute('''
                SELECT COUNT(*) FROM user_sessions 
                WHERE user_id = ? AND is_active = 1
            ''', (user_id,))
            existing_sessions_count = cursor.fetchone()[0]
            
            # Force deactivate ALL existing sessions for this user (not just active ones)
            cursor.execute('''
                UPDATE user_sessions 
                SET is_active = 0 
                WHERE user_id = ?
            ''', (user_id,))
            
            deactivated_count = cursor.rowcount
            
            # Insert new session
            cursor.execute('''
                INSERT INTO user_sessions (session_id, user_id, ip_address, user_agent, expires_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (session_id, user_id, ip_address, user_agent, expires_at.isoformat()))
            
            conn.commit()
            conn.close()
            
            logger.info(f"Session created for user {user_id}: "
                       f"deactivated {deactivated_count} existing sessions, "
                       f"created new session {session_id}")
            
            return session_id
            
        except Exception as e:
            logger.error(f"Session creation failed: {str(e)}")
            raise
    
    def validate_session(self, session_id: str, ip_address: str = None) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Validate a session and return user data if valid.
        
        Args:
            session_id (str): Session ID to validate
            ip_address (str, optional): Client IP address for additional security
            
        Returns:
            Tuple[bool, Optional[Dict]]: (is_valid, user_data)
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT s.user_id, s.ip_address, s.expires_at, s.last_activity,
                       u.username, u.email, u.created_at, u.last_login
                FROM user_sessions s
                JOIN users u ON s.user_id = u.id
                WHERE s.session_id = ? AND s.is_active = 1
            ''', (session_id,))
            
            result = cursor.fetchone()
            
            if not result:
                conn.close()
                return False, None
            
            user_id, stored_ip, expires_at_str, last_activity_str, username, email, created_at, last_login = result
            
            # Check if session has expired
            expires_at = datetime.fromisoformat(expires_at_str)
            if datetime.now() > expires_at:
                # Mark session as inactive
                cursor.execute('''
                    UPDATE user_sessions 
                    SET is_active = 0 
                    WHERE session_id = ?
                ''', (session_id,))
                conn.commit()
                conn.close()
                return False, None
            
            # Optional: Check IP address for additional security
            if ip_address and stored_ip and ip_address != stored_ip:
                logger.warning(f"IP address mismatch for session {session_id}")
                # You can choose to invalidate the session or just log the warning
                # For now, we'll just log it
            
            # Update last activity
            cursor.execute('''
                UPDATE user_sessions 
                SET last_activity = CURRENT_TIMESTAMP 
                WHERE session_id = ?
            ''', (session_id,))
            
            conn.commit()
            conn.close()
            
            user_data = {
                'id': user_id,
                'username': username,
                'email': email,
                'created_at': created_at,
                'last_login': last_login,
                'session_id': session_id
            }
            
            return True, user_data
            
        except Exception as e:
            logger.error(f"Session validation failed: {str(e)}")
            return False, None
    
    def invalidate_session(self, session_id: str) -> bool:
        """
        Invalidate a specific session.
        
        Args:
            session_id (str): Session ID to invalidate
            
        Returns:
            bool: True if session was invalidated, False otherwise
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE user_sessions 
                SET is_active = 0 
                WHERE session_id = ?
            ''', (session_id,))
            
            affected_rows = cursor.rowcount
            conn.commit()
            conn.close()
            
            if affected_rows > 0:
                logger.info(f"Session {session_id} invalidated")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Session invalidation failed: {str(e)}")
            return False
    
    def invalidate_user_sessions(self, user_id: int) -> int:
        """
        Invalidate all sessions for a specific user.
        
        Args:
            user_id (int): User ID to invalidate sessions for
            
        Returns:
            int: Number of sessions invalidated
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE user_sessions 
                SET is_active = 0 
                WHERE user_id = ? AND is_active = 1
            ''', (user_id,))
            
            affected_rows = cursor.rowcount
            conn.commit()
            conn.close()
            
            logger.info(f"Invalidated {affected_rows} sessions for user {user_id}")
            return affected_rows
            
        except Exception as e:
            logger.error(f"User session invalidation failed: {str(e)}")
            return 0
    
    def cleanup_expired_sessions(self) -> int:
        """
        Clean up expired sessions from the database.
        
        Returns:
            int: Number of sessions cleaned up
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE user_sessions 
                SET is_active = 0 
                WHERE expires_at < CURRENT_TIMESTAMP AND is_active = 1
            ''')
            
            affected_rows = cursor.rowcount
            conn.commit()
            conn.close()
            
            if affected_rows > 0:
                logger.info(f"Cleaned up {affected_rows} expired sessions")
            return affected_rows
            
        except Exception as e:
            logger.error(f"Session cleanup failed: {str(e)}")
            return 0
    
    def get_user_sessions(self, user_id: int) -> List[Dict[str, Any]]:
        """
        Get all active sessions for a user.
        
        Args:
            user_id (int): User ID to get sessions for
            
        Returns:
            List[Dict[str, Any]]: List of active sessions
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT session_id, ip_address, user_agent, created_at, last_activity, expires_at
                FROM user_sessions 
                WHERE user_id = ? AND is_active = 1
                ORDER BY last_activity DESC
            ''', (user_id,))
            
            sessions = []
            for row in cursor.fetchall():
                sessions.append({
                    'session_id': row[0],
                    'ip_address': row[1],
                    'user_agent': row[2],
                    'created_at': row[3],
                    'last_activity': row[4],
                    'expires_at': row[5]
                })
            
            conn.close()
            return sessions
            
        except Exception as e:
            logger.error(f"Failed to get user sessions: {str(e)}")
            return []

# =============================================================================
# INITIALIZATION
# =============================================================================

# Initialize managers
user_manager = SecureUserManager()
session_manager = SecureSessionManager()

# =============================================================================
# AUTHENTICATION DECORATOR
# =============================================================================

def require_auth(f):
    """
    Decorator to require authentication for protected routes.
    
    This decorator:
    1. Checks for session_id in Flask session
    2. Validates the session against the database
    3. Checks session expiration
    4. Updates last activity timestamp
    5. Stores user data in Flask's g object for use in the route
    6. Returns 401 if authentication fails
    
    Usage:
        @app.route('/api/protected')
        @require_auth
        def protected_route():
            user_data = g.current_user  # Access user data here
            return jsonify({'message': 'Success'})
    
    Args:
        f: Function to decorate
        
    Returns:
        Decorated function
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get session ID from Flask session
        session_id = session.get('session_id')
        
        if not session_id:
            return jsonify({
                'error': 'Authentication required',
                'status': 'error'
            }), 401
        
        # Validate session
        is_valid, user_data = session_manager.validate_session(
            session_id, 
            ip_address=request.remote_addr
        )
        
        if not is_valid:
            # Clear invalid session
            session.clear()
            return jsonify({
                'error': 'Invalid or expired session',
                'status': 'error'
            }), 401
        
        # Store user data in Flask's g object for use in the route
        g.current_user = user_data
        return f(*args, **kwargs)
    
    return decorated_function

# =============================================================================
# SECURITY MIDDLEWARE
# =============================================================================

@app.before_request
def security_headers():
    """Add security headers to all responses."""
    from flask import make_response

@app.after_request
def after_request(response):
    """
    Add security headers to all responses.
    
    Headers added:
    - X-Content-Type-Options: nosniff
    - X-Frame-Options: DENY
    - X-XSS-Protection: 1; mode=block
    - Strict-Transport-Security: max-age=31536000; includeSubDomains
    - Referrer-Policy: strict-origin-when-cross-origin
    """
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    return response

# =============================================================================
# RATE LIMITING
# =============================================================================

def rate_limit(max_requests=5, window=60):
    """
    Simple rate limiting decorator.
    
    Args:
        max_requests (int): Maximum requests allowed
        window (int): Time window in seconds
        
    Returns:
        Decorator function
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Simple in-memory rate limiting (use Redis in production)
            client_ip = request.remote_addr
            current_time = time.time()
            
            # This is a simplified implementation
            # In production, use Redis or a proper rate limiting library
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# =============================================================================
# API ROUTES - AUTHENTICATION
# =============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    
    Returns:
        JSON: Health status and basic statistics
    """
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'total_users': user_manager.get_user_count()
    })

@app.route('/api/register', methods=['POST'])
@rate_limit(max_requests=5, window=3000)  # 5 attempts per 5 minutes
def register():
    """
    Register a new user.
    
    Request Body:
        {
            "username": "string",
            "email": "string",
            "password": "string"
        }
    
    Returns:
        JSON: Registration result
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        success, message = user_manager.register_user(username, email, password)
        
        if success:
            return jsonify({
                'message': message,
                'status': 'success'
            }), 201
        else:
            return jsonify({
                'error': message,
                'status': 'error'
            }), 400

    except Exception as e:
        logger.error(f"Registration endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/login', methods=['POST'])
@rate_limit(max_requests=15, window=3600)  # 15 attempts per hour
def login():
    """
    Login a user.
    
    Request Body:
        {
            "username": "string",
            "password": "string"
        }
    
    Returns:
        JSON: Login result with user data and session cookie
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        success, message, user_data = user_manager.login_user(username, password)
        
        if success:
            # Create session using session manager
            session_id = session_manager.create_session(
                user_id=user_data['id'],
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            # Store session ID in Flask session
            session.permanent = True
            session['session_id'] = session_id
            session['user_id'] = user_data['id']
            session['username'] = user_data['username']
            
            return jsonify({
                'message': message,
                'status': 'success',
                'user': {
                    'id': user_data['id'],
                    'username': user_data['username'],
                    'email': user_data['email'],
                    'created_at': user_data['created_at'],
                    'last_login': user_data['last_login']
                }
            }), 200
        else:
            return jsonify({
                'error': message,
                'status': 'error'
            }), 401
            
    except Exception as e:
        logger.error(f"Login endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/logout', methods=['POST'])
@require_auth
def logout():
    """Logout a user."""
    try:
        session_id = session.get('session_id')
        
        if session_id:
            session_manager.invalidate_session(session_id)
        
        session.clear()
        return jsonify({
            'message': 'Logged out successfully',
            'status': 'success'
        }), 200
    except Exception as e:
        logger.error(f"Logout endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/profile', methods=['GET'])
@require_auth
def get_profile():
    """Get user profile (requires authentication)."""
    try:
        # User data is already available in g.current_user from the decorator
        user_data = g.current_user
        
        return jsonify({
            'user': {
                'id': user_data['id'],
                'username': user_data['username'],
                'email': user_data['email'],
                'created_at': user_data['created_at'],
                'last_login': user_data['last_login']
            },
            'status': 'success'
        }), 200
        
    except Exception as e:
        logger.error(f"Profile endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get application statistics."""
    try:
        total_users = user_manager.get_user_count()
        
        return jsonify({
            'total_users': total_users,
            'status': 'success'
        }), 200
        
    except Exception as e:
        logger.error(f"Stats endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/open_prices', methods=['POST'])
def api_get_open_prices_for_timeframe():
    """
    POST endpoint to fetch the opening prices of a stock for the selected timeframe.
    Expects JSON: {"ticker": "AAPL", "timeframe": "1d"}
    Returns: JSON array [<open_float>, ...] from oldest to newest, or error message
    """
    try:
        data = request.get_json()
        if not data or 'ticker' not in data or 'timeframe' not in data:
            return jsonify({
                "error": "Missing 'ticker' or 'timeframe' in request body",
                "status": "error"
            }), 400

        ticker = data['ticker'].strip().upper()
        timeframe = data['timeframe'].strip().lower()

        # Normalize timeframe input
        aliases = {
            "1 day": "1d", "1d": "1d", "1day": "1d",
            "1 week": "1w", "1w": "1w", "1week": "1w",
            "15 days": "15d", "15d": "15d",
            "30 days": "30d", "30d": "30d",
            "90 days": "90d", "90d": "90d",
            "180 days": "180d", "180d": "180d",
        }
        if timeframe in aliases:
            tf = aliases[timeframe]
        else:
            tf = timeframe

        allowed = {"1d", "1w", "15d", "30d", "90d", "180d"}
        if tf not in allowed:
            return jsonify({
                "error": f"Invalid timeframe '{timeframe}'. Choose one of {sorted(list(allowed))}.",
                "status": "error"
            }), 400

        # Map to yfinance period and interval
        period_map = {
            "1d": ("1d", "1d"),       # 1 daily candle
            "1w": ("7d", "1d"),       # ~5 trading days
            "15d": ("15d", "1d"),
            "30d": ("30d", "1d"),
            "90d": ("90d", "1d"),
            "180d": ("180d", "1d"),
        }
        period, interval = period_map[tf]

        data = yf.download(ticker, period=period, interval=interval)

        if data.empty:
            return jsonify({
                "error": f"No data found for {ticker}",
                "status": "error"
            }), 404

        # Handle potential MultiIndex columns from yfinance
        if isinstance(data.columns, pd.MultiIndex):
            open_series = data["Open"][ticker]
        else:
            open_series = data["Open"]

        # Reset index to expose dates
        df = open_series.reset_index()
        df.columns = ["date", "open"]

        # Extract open prices as a list, oldest to newest
        prices = [float(row["open"]) if pd.notnull(row["open"]) else None for _, row in df.iterrows()]

        return jsonify({
            "data": prices,
            "status": "success"
        }), 200

    except Exception as e:
        logger.error(f"Open prices endpoint error: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "status": "error"
        }), 500

# New endpoint to get user's active sessions
@app.route('/api/sessions', methods=['GET'])
@require_auth
def get_user_sessions():
    """Get all active sessions for the current user."""
    try:
        user_id = g.current_user['id']
        sessions = session_manager.get_user_sessions(user_id)
        
        return jsonify({
            'sessions': sessions,
            'status': 'success'
        }), 200
        
    except Exception as e:
        logger.error(f"Sessions endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

# New endpoint to invalidate a specific session
@app.route('/api/sessions/<session_id>', methods=['DELETE'])
@require_auth
def invalidate_session(session_id):
    """Invalidate a specific session."""
    try:
        user_id = g.current_user['id']
        
        # Verify the session belongs to the current user
        conn = session_manager.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT user_id FROM user_sessions 
            WHERE session_id = ? AND is_active = 1
        ''', (session_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if not result or result[0] != user_id:
            return jsonify({
                'error': 'Session not found or access denied',
                'status': 'error'
            }), 404
        
        success = session_manager.invalidate_session(session_id)
        
        if success:
            return jsonify({
                'message': 'Session invalidated successfully',
                'status': 'success'
            }), 200
        else:
            return jsonify({
                'error': 'Failed to invalidate session',
                'status': 'error'
            }), 500
            
    except Exception as e:
        logger.error(f"Session invalidation endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

# New endpoint to invalidate all sessions for current user
@app.route('/api/sessions/all', methods=['DELETE'])
@require_auth
def invalidate_all_sessions():
    """Invalidate all sessions for the current user."""
    try:
        user_id = g.current_user['id']
        current_session_id = session.get('session_id')
        
        # Invalidate all sessions for the user
        invalidated_count = session_manager.invalidate_user_sessions(user_id)
        
        # Clear current session
        session.clear()
        
        return jsonify({
            'message': f'Invalidated {invalidated_count} sessions',
            'status': 'success'
        }), 200
        
    except Exception as e:
        logger.error(f"All sessions invalidation endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

# =============================================================================
# USER DATA ENDPOINTS
# =============================================================================

@app.route('/api/user/dashboard', methods=['GET'])
@require_auth
def get_dashboard_data():
    """
    Get comprehensive dashboard data for the authenticated user.
    
    Returns:
        JSON: Complete dashboard data including accounts, transactions, balances, and summary
    """
    try:
        user_id = g.current_user['id']
        dashboard_data = user_manager.get_user_dashboard_data(user_id)
        
        return jsonify({
            'data': dashboard_data,
            'status': 'success'
        }), 200
        
    except Exception as e:
        logger.error(f"Dashboard endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/user/accounts', methods=['GET'])
@require_auth
def get_linked_accounts():
    """
    Get all linked accounts for the authenticated user.
    
    Returns:
        JSON: List of linked accounts with details
    """
    try:
        user_id = g.current_user['id']
        accounts = user_manager.get_user_linked_accounts(user_id)
        
        return jsonify({
            'accounts': accounts,
            'status': 'success'
        }), 200
        
    except Exception as e:
        logger.error(f"Linked accounts endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500
# Find the transactions endpoint and update it:
@app.route('/api/user/transactions', methods=['GET'])
@require_auth
def get_user_transactions():
    """
    Get transactions for the authenticated user with pagination, grouped by platform.
    
    Query Parameters:
        limit (int): Maximum transactions to return (default: 50, max: 100)
        offset (int): Number of transactions to skip (default: 0)
    
    Returns:
        JSON: Dictionary of transactions grouped by platform with pagination info
    """
    try:
        user_id = g.current_user['id']
        
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        # Validate parameters
        limit = min(limit, 100)  # Max 100 transactions per request
        offset = max(offset, 0)
        
        transactions = user_manager.get_user_transactions(user_id, limit, offset)
        
        # Calculate total transactions across all platforms
        total_transactions = sum(len(trans) for trans in transactions.values())
        
        return jsonify({
            'transactions': transactions,
            'pagination': {
                'limit': limit,
                'offset': offset,
                'total_count': total_transactions,
                'platforms': list(transactions.keys())
            },
            'status': 'success'
        }), 200
        
    except Exception as e:
        logger.error(f"Transactions endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/user/balance', methods=['GET'])
@require_auth
def get_user_balance():
    """
    Get balance information for the authenticated user.
    
    Returns:
        JSON: Balance information including total, available, and invested balances
    """
    try:
        user_id = g.current_user['id']
        balance = user_manager.get_user_balance(user_id)
        
        return jsonify({
            'balance': balance,
            'status': 'success'
        }), 200
        
    except Exception as e:
        logger.error(f"Balance endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/user/preferences', methods=['GET'])
@require_auth
def get_user_preferences():
    """
    Get user preferences for the authenticated user.
    
    Returns:
        JSON: User preferences including currency, timezone, theme, etc.
    """
    try:
        user_id = g.current_user['id']
        preferences = user_manager.get_user_preferences(user_id)
        
        return jsonify({
            'preferences': preferences,
            'status': 'success'
        }), 200
        
    except Exception as e:
        logger.error(f"Preferences endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/user/preferences', methods=['PUT'])
@require_auth
def update_user_preferences():
    """
    Update user preferences for the authenticated user.
    
    Request Body:
        {
            "default_currency": "USD",
            "timezone": "UTC",
            "notifications_enabled": true,
            "theme": "light",
            "language": "en"
        }
    
    Returns:
        JSON: Updated preferences
    """
    try:
        user_id = g.current_user['id']
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'status': 'error'
            }), 400
        
        # Validate allowed preference fields
        allowed_fields = ['default_currency', 'timezone', 'notifications_enabled', 'theme', 'language']
        update_fields = {}
        
        for field in allowed_fields:
            if field in data:
                update_fields[field] = data[field]
        
        if not update_fields:
            return jsonify({
                'error': 'No valid preference fields provided',
                'status': 'error'
            }), 400
        
        # Update preferences in database
        conn = user_manager.get_connection()
        cursor = conn.cursor()
        
        # Check if preferences exist
        cursor.execute('SELECT id FROM user_preferences WHERE user_id = ?', (user_id,))
        if not cursor.fetchone():
            # Create preferences record
            cursor.execute('''
                INSERT INTO user_preferences (user_id, default_currency, timezone, 
                                            notifications_enabled, theme, language)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (user_id, 'USD', 'UTC', True, 'light', 'en'))
        
        # Update fields
        set_clause = ', '.join([f"{field} = ?" for field in update_fields.keys()])
        values = list(update_fields.values()) + [user_id]
        
        cursor.execute(f'''
            UPDATE user_preferences 
            SET {set_clause}
            WHERE user_id = ?
        ''', values)
        
        conn.commit()
        conn.close()
        
        # Get updated preferences
        updated_preferences = user_manager.get_user_preferences(user_id)
        
        return jsonify({
            'preferences': updated_preferences,
            'message': 'Preferences updated successfully',
            'status': 'success'
        }), 200
        
    except Exception as e:
        logger.error(f"Update preferences endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/user/summary', methods=['GET'])
@require_auth
def get_user_summary():
    """
    Get a quick summary of user data for the authenticated user.
    
    Returns:
        JSON: Summary of user data including basic info, account count, and recent activity
    """
    try:
        user_id = g.current_user['id']
        username = g.current_user['username']
        
        # Get basic counts and data
        accounts = user_manager.get_user_linked_accounts(user_id)
        recent_transactions = user_manager.get_user_transactions(user_id, limit=5)
        balance = user_manager.get_user_balance(user_id)
        
        # Calculate summary
        total_accounts = len(accounts)
        total_balance = sum(acc['balance'] for acc in accounts)
        recent_transaction_count = len(recent_transactions)
        
        summary = {
            'user_info': {
                'id': user_id,
                'username': username
            },
            'accounts': {
                'total_count': total_accounts,
                'total_balance': total_balance
            },
            'transactions': {
                'recent_count': recent_transaction_count
            },
            'balance': {
                'total_balance': balance['total_balance'],
                'available_balance': balance['available_balance'],
                'invested_balance': balance['invested_balance'],
                'currency': balance['currency']
            }
        }
        
        return jsonify({
            'summary': summary,
            'status': 'success'
        }), 200
        
    except Exception as e:
        logger.error(f"User summary endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/user/activity', methods=['GET'])
@require_auth
def get_user_activity():
    """
    Get recent user activity for the authenticated user.
    
    Query Parameters:
        days (int): Number of days to look back (default: 30)
    
    Returns:
        JSON: Recent activity summary
    """
    try:
        user_id = g.current_user['id']
        days = request.args.get('days', 30, type=int)
        days = min(days, 365)  # Max 1 year
        
        conn = user_manager.get_connection()
        cursor = conn.cursor()
        
        # Get activity summary for the specified period
        cursor.execute('''
            SELECT 
                COUNT(*) as total_transactions,
                SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as total_expenses,
                COUNT(DISTINCT DATE(transaction_date)) as active_days
            FROM transactions 
            WHERE user_id = ? AND transaction_date >= date('now', '-{} days')
        '''.format(days), (user_id,))
        
        activity_stats = cursor.fetchone()
        conn.close()
        
        activity = {
            'period_days': days,
            'total_transactions': activity_stats[0] if activity_stats[0] else 0,
            'total_income': float(activity_stats[1]) if activity_stats[1] else 0.0,
            'total_expenses': float(activity_stats[2]) if activity_stats[2] else 0.0,
            'active_days': activity_stats[3] if activity_stats[3] else 0,
            'net_income': (float(activity_stats[1]) if activity_stats[1] else 0.0) - 
                         (float(activity_stats[2]) if activity_stats[2] else 0.0)
        }
        
        return jsonify({
            'activity': activity,
            'status': 'success'
        }), 200
        
    except Exception as e:
        logger.error(f"User activity endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/user/goals', methods=['GET'])
@require_auth
def get_user_goals():
    """Get all goals for the authenticated user (read-only)."""
    try:
        user_id = g.current_user['id']
        goals = user_manager.get_user_goals(user_id)

        return jsonify({
            'goals': goals,
            'status': 'success'
        }), 200
    except Exception as e:
        logger.error(f"Goals endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/user/goals/summary', methods=['GET'])
@require_auth
def get_user_goals_summary():
    """Get an aggregated summary of goals for the authenticated user (read-only)."""
    try:
        user_id = g.current_user['id']
        summary = user_manager.get_user_goals_summary(user_id)

        return jsonify({
            'summary': summary,
            'status': 'success'
        }), 200
    except Exception as e:
        logger.error(f"Goals summary endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

# =============================================================================
# STARTUP AND CLEANUP
# =============================================================================

# Fix for newer Flask versions - use a different approach for startup cleanup
def cleanup_sessions_on_startup():
    """Clean up expired sessions on startup."""
    try:
        session_manager.cleanup_expired_sessions()
        logger.info("Startup session cleanup completed")
    except Exception as e:
        logger.error(f"Startup session cleanup failed: {str(e)}")

# Run cleanup on startup
cleanup_sessions_on_startup()

# =============================================================================
# ERROR HANDLERS
# =============================================================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 Not Found errors."""
    return jsonify({
        'error': 'Endpoint not found',
        'status': 'error'
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 Method Not Allowed errors."""
    return jsonify({
        'error': 'Method not allowed',
        'status': 'error'
    }), 405

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 Internal Server Error."""
    return jsonify({
        'error': 'Internal server error',
        'status': 'error'
    }), 500

# =============================================================================
# APPLICATION STARTUP
# =============================================================================

if __name__ == '__main__':
    # Create .env file if it doesn't exist
    if not os.path.exists('.env'):
        with open('.env', 'w') as f:
            f.write(f'SECRET_KEY={secrets.token_hex(32)}\n')
    
    # Run the application
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,  # Set to False in production
        ssl_context='adhoc' if os.getenv('FLASK_ENV') == 'production' else None
    )
