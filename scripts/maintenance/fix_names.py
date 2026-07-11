import sqlite3

conn = sqlite3.connect(r'c:\Users\priyer\.gemini\antigravity-ide\scratch\OneChoiceKitchen\dev.db')
conn.execute("UPDATE RestaurantTable SET tableNumber = REPLACE(tableNumber, 'Table ', '')")
conn.commit()
conn.close()
