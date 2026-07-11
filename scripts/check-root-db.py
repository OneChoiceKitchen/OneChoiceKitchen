import sqlite3

conn = sqlite3.connect('dev.db')
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cur.fetchall()]
print('Tables in root dev.db:', tables[:25])
if 'User' in tables:
    cur.execute('SELECT email, role FROM User LIMIT 10')
    rows = cur.fetchall()
    print('Users:', rows)
    cur.execute("SELECT email, role FROM User WHERE role IN ('ADMIN','SUPER_ADMIN') LIMIT 10")
    admins = cur.fetchall()
    print('Admins:', admins)
else:
    print('No User table in root dev.db')
conn.close()
