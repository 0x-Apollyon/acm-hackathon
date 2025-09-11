import sqlite3
from faker import Faker
from datetime import datetime, timedelta
import random
from typing import List, Dict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataSeeder:
    def __init__(self, db_path: str = "users.db"):
        self.db_path = db_path
        self.fake = Faker()
        # Add more locales for international transactions
        Faker.seed(12345)  # For reproducible data
        
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Enable row factory for named columns
        return conn

    def get_existing_users(self) -> List[Dict]:
        """Get all existing users from the database."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id, username, email FROM users')
        users = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return users

    def generate_bank_accounts(self, user_id: int) -> None:
        """Generate realistic bank accounts for a user."""
        banks = [
            ("Chase", "bank", "Primary Checking"),            # Changed from "checking"
            ("Chase", "bank", "Savings Account"),             # Changed from "savings"
            ("Bank of America", "bank", "Secondary Checking"), # Changed from "checking"
            ("Citibank", "investment", "Investment Portfolio"),
            ("Vanguard", "investment", "Retirement Fund"),
            ("Robinhood", "investment", "Stock Trading"),
            ("Wells Fargo", "bank", "Emergency Fund"),        # Changed from "savings"
            ("Coinbase", "crypto", "Crypto Wallet")
        ]
        
        conn = self.get_connection()
        cursor = conn.cursor()
        
        for bank in banks:
            if random.random() < 0.7:  # 70% chance to have each account
                balance = round(random.uniform(1000, 50000), 2)
                account_number = f"****{str(random.randint(1000, 9999))}"
                
                cursor.execute('''
                    INSERT INTO linked_accounts (
                        user_id, account_name, account_type, institution_name,
                        account_number_masked, balance, currency, is_active,
                        linked_at, last_sync
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    user_id, bank[2], bank[1], bank[0],
                    account_number, balance, 'USD', True,
                    self.fake.date_time_between(start_date='-1y').isoformat(),
                    self.fake.date_time_between(start_date='-1d').isoformat()
                ))
        
        conn.commit()
        conn.close()

    def generate_transactions(self, user_id: int) -> None:
        """Generate realistic transactions for a user."""
        # Get user's accounts
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id, institution_name FROM linked_accounts WHERE user_id = ?', (user_id,))
        accounts = cursor.fetchall()

        # Transaction categories and descriptions
        categories = {
            'income': [
                ('Salary', ['Monthly Salary', 'Bi-weekly Pay', 'Direct Deposit - Employer']),
                ('Investment', ['Dividend Payment', 'Stock Sale', 'Investment Return']),
                ('Freelance', ['Consulting Fee', 'Freelance Project', 'Contract Work']),
                ('Other', ['Refund', 'Reimbursement', 'Gift Received'])
            ],
            'expense': [
                ('Food & Dining', ['Grocery Shopping', 'Restaurant', 'Coffee Shop', 'Food Delivery']),
                ('Bills & Utilities', ['Electricity Bill', 'Water Bill', 'Internet Service', 'Phone Bill']),
                ('Transport', ['Gas Station', 'Uber Ride', 'Public Transit', 'Car Maintenance']),
                ('Shopping', ['Amazon.com', 'Target', 'Walmart', 'Best Buy']),
                ('Entertainment', ['Netflix', 'Spotify', 'Movie Tickets', 'Gaming']),
                ('Health', ['Pharmacy', 'Doctor Visit', 'Gym Membership', 'Health Insurance']),
                ('Travel', ['Flight Tickets', 'Hotel Booking', 'Car Rental', 'Travel Insurance']),
                ('Home', ['Rent Payment', 'Home Insurance', 'Furniture', 'Home Maintenance'])
            ]
        }

        # Generate transactions for the last 180 days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=180)
        
        # Generate 300-500 transactions per user
        num_transactions = random.randint(300, 500)
        
        for _ in range(num_transactions):
            account = random.choice(accounts)
            trans_type = random.choices(['income', 'expense'], weights=[0.3, 0.7])[0]
            
            category, descriptions = random.choice(categories[trans_type])
            description = random.choice(descriptions)
            
            if trans_type == 'income':
                amount = round(random.uniform(1000, 5000), 2)
            else:
                amount = round(random.uniform(10, 500), 2)
                if category in ['Rent Payment', 'Travel']:
                    amount *= 5  # Higher amounts for certain categories
            
            date = self.fake.date_time_between(start_date=start_date, end_date=end_date)
            
            cursor.execute('''
                INSERT INTO transactions (
                    user_id, account_id, transaction_type, amount, currency,
                    description, category, platform, transaction_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id, 
                account['id'], 
                trans_type, 
                amount, 
                'USD',  
                description, 
                category, 
                account['institution_name'], 
                date.isoformat()  # This was in wrong position before
            ))

        conn.commit()
        conn.close()

    def update_balances(self, user_id: int) -> None:
        """Update user balances based on transactions."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Calculate totals from transactions
        cursor.execute('''
            SELECT 
                SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE -amount END) as net_amount,
                SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as total_expenses
            FROM transactions 
            WHERE user_id = ?
        ''', (user_id,))
        
        result = cursor.fetchone()
        net_amount = result['net_amount'] or 0
        
        # Update user_balances
        cursor.execute('''
            INSERT OR REPLACE INTO user_balances (
                user_id, total_balance, available_balance, invested_balance, 
                currency, last_updated
            ) VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            net_amount,
            net_amount * 0.6,  # 60% available
            net_amount * 0.4,  # 40% invested
            'USD',
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()

    def generate_preferences(self, user_id: int) -> None:
        """Generate user preferences."""
        themes = ['light', 'dark', 'auto']
        languages = ['en', 'es', 'fr']
        timezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo']
        
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO user_preferences (
                user_id, default_currency, timezone, notifications_enabled,
                theme, language
            ) VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            'USD',
            random.choice(timezones),
            random.choice([True, True, False]),  # 66% chance of notifications enabled
            random.choice(themes),
            random.choice(languages)
        ))
        
        conn.commit()
        conn.close()

    def generate_goals(self, user_id: int) -> None:
        """Generate financial goals for the user."""
        goals = [
            ("Emergency Fund", "Build emergency fund for 6 months of expenses", 15000),
            ("Vacation Savings", "Save for dream vacation to Europe", 5000),
            ("New Car", "Down payment for new car", 10000),
            ("Home Down Payment", "Save for house down payment", 50000),
            ("Retirement Boost", "Additional retirement savings", 25000),
            ("Education Fund", "Save for professional development courses", 3000)
        ]
        
        conn = self.get_connection()
        cursor = conn.cursor()
        
        for goal in goals:
            if random.random() < 0.6:  # 60% chance to have each goal
                target = goal[2]
                progress = round(random.uniform(0, target), 2)
                due_date = self.fake.date_time_between(
                    start_date='+1m', 
                    end_date='+2y'
                ).isoformat()
                
                cursor.execute('''
                    INSERT INTO goals (
                        user_id, title, description, target, progress,
                        due_date, default_currency
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    user_id, goal[0], goal[1], target, progress,
                    due_date, 'USD'
                ))
        
        conn.commit()
        conn.close()

    def seed_data(self) -> None:
        """Main method to seed all data."""
        try:
            users = self.get_existing_users()
            
            for user in users:
                logger.info(f"Seeding data for user: {user['username']}")
                
                # Generate data in sequence
                self.generate_bank_accounts(user['id'])
                self.generate_transactions(user['id'])
                self.update_balances(user['id'])
                self.generate_preferences(user['id'])
                self.generate_goals(user['id'])
                
                logger.info(f"Completed seeding data for user: {user['username']}")
            
            logger.info("Data seeding completed successfully!")
            
        except Exception as e:
            logger.error(f"Error seeding data: {str(e)}")
            raise

if __name__ == "__main__":
    seeder = DataSeeder()
    seeder.seed_data()