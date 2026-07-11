import sqlite3
import uuid

# Connect to database
conn = sqlite3.connect(r'c:\Users\priyer\.gemini\antigravity-ide\scratch\OneChoiceKitchen\dev.db')
cursor = conn.cursor()

# Find restaurant
cursor.execute("SELECT id, name FROM Restaurant WHERE name LIKE '%Choice%'")
restaurant = cursor.fetchone()
if not restaurant:
    print("Restaurant not found")
    exit(1)
rest_id = restaurant[0]
print(f"Restaurant: {restaurant[1]}")

# Find branch
cursor.execute("SELECT id, name FROM RestaurantBranch WHERE name LIKE '%ramkrish%' AND restaurantId = ?", (rest_id,))
branch = cursor.fetchone()
if not branch:
    print("Branch not found")
    exit(1)
branch_id = branch[0]
print(f"Branch: {branch[1]}")

# Add 4 tables
for i in range(1, 5):
    table_id = str(uuid.uuid4())
    qr_url = f"http://localhost:4211?table={table_id}&branch={branch_id}"
    cursor.execute("""
        INSERT INTO "RestaurantTable" (id, tableNumber, capacity, isAvailable, qrCodeUrl, restaurantId, branchId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    """, (table_id, f"Table {i}", 4, 1, qr_url, rest_id, branch_id))
    print(f"Created Table {i}")

conn.commit()
conn.close()
