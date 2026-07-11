import sqlite3

conn = sqlite3.connect('prisma/dev.db')
cur = conn.cursor()

# List all tables
cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [r[0] for r in cur.fetchall()]
print("Tables:", tables)

# Check Branch table
if 'Branch' in tables:
    cur.execute("SELECT id, name, restaurantId FROM Branch")
    print("\nBranches:")
    for row in cur.fetchall():
        print(f"  id={row[0]}, name={row[1]}, restaurantId={row[2]}")

# Check Restaurant table
if 'Restaurant' in tables:
    cur.execute("SELECT id, name FROM Restaurant")
    print("\nRestaurants:")
    for row in cur.fetchall():
        print(f"  id={row[0]}, name={row[1]}")

conn.close()
