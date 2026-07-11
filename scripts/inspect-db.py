import sqlite3
import hashlib
import os
import sys

# bcrypt-like using SHA256 (since we can't install bcrypt in Python easily)
# But the app uses bcrypt — we'll use the API's /auth/register or direct DB with a known bcrypt hash

# Pre-computed bcrypt hash for "test123" with salt rounds=10:
# This is a valid bcrypt hash you can verify: $2b$10$...
# We'll insert directly into SQLite

db_path = 'prisma/dev.db'
if not os.path.exists(db_path):
    print('ERROR: Cannot find prisma/dev.db')
    sys.exit(1)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Show tables
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cur.fetchall()]
print('Tables:', tables)

if 'User' in tables:
    cur.execute("PRAGMA table_info(User)")
    cols = [r[1] for r in cur.fetchall()]
    print('User columns:', cols)

    # Check existing
    cur.execute("SELECT id, email, role FROM User LIMIT 20")
    rows = cur.fetchall()
    print('Users:', rows)
else:
    print('No User table found!')

conn.close()
