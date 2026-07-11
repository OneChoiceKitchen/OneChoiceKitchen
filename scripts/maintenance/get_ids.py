import sqlite3
conn = sqlite3.connect('dev.db')
print(conn.execute("SELECT createdAt, updatedAt FROM TiffinMenu LIMIT 1").fetchall())
