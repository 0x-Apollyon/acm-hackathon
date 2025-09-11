import sqlite3

conn = sqlite3.connect('main.db')
cursor = conn.cursor()

cursor.execute('''
CREATE TABLE main (
    userid TEXT,
    chapter1 INT,
    chapter2 INT,
    chapter3 INT,
    chapter4 INT,
    chapter5 INT,
    chapter6 INT,
    chapter7 INT,
    chapter8 INT,
    contributions TEXT,
    percentage_complete INT
)
''')

conn.commit()
conn.close()