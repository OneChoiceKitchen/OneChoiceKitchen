import sqlite3
conn = sqlite3.connect('dev.db')
cursor = conn.cursor()
cursor.execute("UPDATE TiffinMenu SET dietType = 'NON_VEG' WHERE dietType = 'NON-VEG'")
days = {'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu', 'Friday': 'Fri', 'Saturday': 'Sat', 'Sunday': 'Sun'}
for full, short in days.items():
    cursor.execute("UPDATE TiffinMenu SET dayOfWeek = ? WHERE dayOfWeek = ?", (short, full))
conn.commit()
conn.close()
