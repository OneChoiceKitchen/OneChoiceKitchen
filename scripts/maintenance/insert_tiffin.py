import sqlite3
import uuid
import datetime

conn = sqlite3.connect('dev.db')
cursor = conn.cursor()

restaurant_id = 'e7447fd2-71e8-46e2-9883-db8e23899f36'
branch_id = '05000c0d-f9bb-4ab6-9a68-2789b956f2d0'

now = datetime.datetime.utcnow().isoformat() + "Z"

def insert_item(name, meal_type, diet_type, day_of_week):
    id_val = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO TiffinMenu (id, restaurantId, branchId, name, mealType, dietType, dayOfWeek, price, isAvailable, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (id_val, restaurant_id, branch_id, name, meal_type, diet_type, day_of_week, 0.0, 1, now, now))

menu = {
    "VEG": {
        "Monday": {
            "Breakfast": "2 Alloo Paratha + Seasonal Chanti + Salad",
            "Lunch": "Rice + Dal + 2 Roti + Seasonal Sabzi + Salad",
            "Dinner": "Veg Pulao + Tadka Daal + Raita"
        },
        "Tuesday": {
            "Breakfast": "5 Poori + Seasonal Sabji + Salad",
            "Lunch": "Rajma + Chawal + 2 Roti + Salad",
            "Dinner": "4 Roti + Mix Veg + Salad"
        },
        "Wednesday": {
            "Breakfast": "2 Paneer Paratha + Seasonal Chanti + Salad",
            "Lunch": "Kadi + Rice + 2 Roti + Salad",
            "Dinner": "Rice + Tadka Dal + 2 Roti + Seasonal Sabzi + Salad"
        },
        "Thursday": {
            "Breakfast": "5 Idli + Sambar + Chatni",
            "Lunch": "Tarka Dal + Rice + 2 Roti + Salad",
            "Dinner": "Paneer Rice + 2 Paratha"
        },
        "Friday": {
            "Breakfast": "Normal Paratha + Seasonal Bhuiya",
            "Lunch": "Mix Veg + Pulao + Dal + Salad",
            "Dinner": "Mix Veg + Fried Rice"
        },
        "Saturday": {
            "Breakfast": "Poha / Upma",
            "Lunch": "Khichdi + Chokha + Papad",
            "Dinner": "Fried Rice + Manchurian + Salad"
        },
        "Sunday": {
            "Breakfast": "2 Litti / Katchori + Seasonal Sabji + Onion",
            "Lunch": "Paneer Sabzi + Rice + Dal + Salad",
            "Dinner": "Dal Tadka + Jeera Rice + Salad"
        }
    },
    "NON-VEG": {
        "Monday": {
            "Breakfast": "2 Alloo Paratha + Seasonal Chanti + Salad",
            "Lunch": "Rice + Dal + 2 Roti + Seasonal Sabzi + Salad",
            "Dinner": "Veg Pulao + Tadka Daal + Raita"
        },
        "Tuesday": {
            "Breakfast": "5 Poori + Seasonal Sabji + Salad",
            "Lunch": "Rajma + Chawal + 2 Roti + Salad",
            "Dinner": "4 Roti + Mix Veg + Salad"
        },
        "Wednesday": {
            "Breakfast": "2 Egg Omelet / Poha",
            "Lunch": "Egg Curry + Rice + 2 Roti + Salad",
            "Dinner": "Mix Veg Fried Rice + Omlette Curry + Salad"
        },
        "Thursday": {
            "Breakfast": "5 Idli + Sambar + Chatni",
            "Lunch": "Tarka Dal + Rice + 2 Roti + Salad",
            "Dinner": "Paneer Rice + 2 Paratha"
        },
        "Friday": {
            "Breakfast": "Normal Paratha + Seasonal Bhuiya",
            "Lunch": "Fish Curry + Rice",
            "Dinner": "Mix Veg + Fried Rice"
        },
        "Saturday": {
            "Breakfast": "Poha / Upma",
            "Lunch": "Khichdi + Chokha + Papad",
            "Dinner": "Fried Rice + Manchurian + Salad"
        },
        "Sunday": {
            "Breakfast": "2 Litti / Katchori + Seasonal Sabji + Onion",
            "Lunch": "Chicken Curry + Rice + 2 Roti + Salad",
            "Dinner": "Dal Tadka + Jeera Rice + Salad"
        }
    }
}

for diet, days in menu.items():
    for day, meals in days.items():
        for meal, items in meals.items():
            insert_item(items, meal, diet, day)

conn.commit()
print("Done inserting")
conn.close()
