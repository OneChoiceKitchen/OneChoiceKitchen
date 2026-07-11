import sqlite3

conn = sqlite3.connect('dev.db')
cur = conn.cursor()

# User table columns
cur.execute('PRAGMA table_info(User)')
cols = cur.fetchall()
print('User columns:')
for c in cols:
    print(' ', c)

# All users
cur.execute('SELECT * FROM User LIMIT 5')
users = cur.fetchall()
print('\nFirst 5 users:', users)

conn.close()
