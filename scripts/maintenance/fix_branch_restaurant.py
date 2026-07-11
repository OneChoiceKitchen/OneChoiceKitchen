import sqlite3

conn = sqlite3.connect('dev.db')
cur = conn.cursor()

# Check RestaurantBranch table - the actual branch table
cur.execute("SELECT id, name, restaurantId FROM RestaurantBranch")
print("RestaurantBranch (all):")
for row in cur.fetchall():
    print(f"  id={row[0]}, name={row[1]}, restaurantId={row[2]}")

# Perform the update - move all 3 seed branches to One Choice Kitchen (Main)
print("\nUpdating 3 seed branches to One Choice Kitchen (Main)...")
cur.execute("""
    UPDATE RestaurantBranch 
    SET restaurantId = 'e7447fd2-71e8-46e2-9883-db8e23899f36' 
    WHERE restaurantId = 'seed-restaurant-onechoicekitchen'
""")
conn.commit()
print(f"Updated {cur.rowcount} branches")

# Verify
cur.execute("SELECT id, name, restaurantId FROM RestaurantBranch")
print("\nRestaurantBranch after update:")
for row in cur.fetchall():
    print(f"  id={row[0]}, name={row[1]}, restaurantId={row[2]}")

conn.close()
print("\nDone!")
