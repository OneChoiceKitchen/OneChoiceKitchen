import sqlite3
import uuid
import datetime

conn = sqlite3.connect('dev.db')
cur = conn.cursor()

# Get or create SUPER_ADMIN role
cur.execute("SELECT id FROM Role WHERE name='SUPER_ADMIN'")
row = cur.fetchone()
if row:
    role_id = row[0]
    print(f'Found SUPER_ADMIN role: {role_id}')
else:
    role_id = str(uuid.uuid4())
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    cur.execute("INSERT INTO Role (id, name, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
                (role_id, 'SUPER_ADMIN', 'Super Administrator', now, now))
    print(f'Created SUPER_ADMIN role: {role_id}')

# bcrypt hash for "test123" (rounds=10) - freshly computed by node
# $2b$10$QwCTsmCW5QcYMz2e9Ubtgu6TrOTAed4AUQ0eZ9NSIGdKMMXCCYg3i
HASH = '$2b$10$QwCTsmCW5QcYMz2e9Ubtgu6TrOTAed4AUQ0eZ9NSIGdKMMXCCYg3i'

now = datetime.datetime.now(datetime.timezone.utc).isoformat()

emails_to_fix = [
    ('admin@test.com',    'Administrator',  '+919999999990', 'ADMN001'),
    ('customer@test.com', 'Admin Customer', '+919999999991', 'ADMN002'),
]

for email, name, phone, ref in emails_to_fix:
    cur.execute("SELECT id FROM User WHERE email=?", (email,))
    existing = cur.fetchone()
    if existing:
        cur.execute("UPDATE User SET roleId=?, password=?, name=?, isActive=1, updatedAt=? WHERE email=?",
                    (role_id, HASH, name, now, email))
        print(f'Updated {email} -> SUPER_ADMIN, password=test123')
    else:
        uid = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO User (id, email, password, name, mobile, isActive, roleId, referralCode, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
        """, (uid, email, HASH, name, phone, role_id, ref, now, now))
        print(f'Created {email} -> SUPER_ADMIN, password=test123')

# Clear any lockouts
cur.execute("DELETE FROM FailedLoginAttempt WHERE 1=1")
print('Cleared all login lockouts')

conn.commit()
print('\nAll done! Login with any of:')
print('  admin@test.com / test123')
print('  customer@test.com / test123')

conn.close()
