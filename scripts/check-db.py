import sqlite3
import os
import sys
import hashlib
import struct

# Find dev.db
for db_path in ['prisma/dev.db', 'dev.db', 'apps/api/dev.db']:
    if os.path.exists(db_path):
        print(f'Found DB: {db_path}')
        break
else:
    print('ERROR: Cannot find dev.db')
    sys.exit(1)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

# List tables
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cur.fetchall()]
print('Tables:', tables)

# Check for User table
if 'User' in tables:
    cur.execute("PRAGMA table_info(User)")
    cols = [r[1] for r in cur.fetchall()]
    print('User columns:', cols)
    
    cur.execute("SELECT email, role FROM User LIMIT 10")
    rows = cur.fetchall()
    print('Users:', rows)
    
    cur.execute("SELECT email, role FROM User WHERE email = 'admin@test.com'")
    admin = cur.fetchone()
    print('admin@test.com:', admin)
    
    cur.execute("SELECT email, role FROM User WHERE email = 'admin@onechoicekitchen.com'")
    admin2 = cur.fetchone()
    print('admin@onechoicekitchen.com:', admin2)
else:
    print('No User table! Available:', tables)

conn.close()
