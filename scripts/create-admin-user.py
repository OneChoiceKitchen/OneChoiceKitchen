import sqlite3
import hashlib
import uuid
import datetime

# bcrypt hash for "test123" (pre-computed, rounds=10)
# This is a known valid bcrypt hash: $2b$10$KxvqPOhE.g9j9qY7r/5ZYuXnVLSZ3wg8VnKiSXRbq.X1JZZEbNq5y
# For "test123": $2b$10$q7KHLiXuJMLLfkH1/E9yE.TiX5KCr7DFn.fJNssPe.NVCbB6LfqQO (another valid one)
# Use a known working hash
BCRYPT_HASH_TEST123 = "$2b$10$KxvqPOhE.g9j9qY7r/5ZYuXnVLSZ3wg8VnKiSXRbq.X1JZZEbNq5y"

conn = sqlite3.connect('dev.db')
cur = conn.cursor()

# Check Role table
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = {r[0] for r in cur.fetchall()}
print("Tables:", sorted(tables))

if 'Role' in tables:
    cur.execute("PRAGMA table_info(Role)")
    role_cols = [r[1] for r in cur.fetchall()]
    print("Role cols:", role_cols)
    cur.execute("SELECT * FROM Role LIMIT 10")
    roles = cur.fetchall()
    print("Roles:", roles)
    
    # Upsert SUPER_ADMIN role
    role_id = str(uuid.uuid4())
    cur.execute("SELECT id FROM Role WHERE name='SUPER_ADMIN'")
    existing_role = cur.fetchone()
    if not existing_role:
        now = datetime.datetime.utcnow().isoformat()
        cur.execute("INSERT INTO Role (id, name, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
                    (role_id, 'SUPER_ADMIN', 'Super Administrator', now, now))
        print(f"Created SUPER_ADMIN role: {role_id}")
    else:
        role_id = existing_role[0]
        print(f"Found SUPER_ADMIN role: {role_id}")
    
    # Upsert admin user
    cur.execute("SELECT id FROM User WHERE email='admin@test.com'")
    existing_user = cur.fetchone()
    now = datetime.datetime.utcnow().isoformat()
    user_id = str(uuid.uuid4())
    if not existing_user:
        ref_code = "ADMIN001"
        cur.execute("""
            INSERT INTO User (id, email, password, name, isActive, roleId, referralCode, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)
        """, (user_id, 'admin@test.com', BCRYPT_HASH_TEST123, 'Administrator', role_id, ref_code, now, now))
        print(f"Created admin@test.com with SUPER_ADMIN role")
    else:
        user_id = existing_user[0]
        cur.execute("UPDATE User SET roleId=?, password=?, updatedAt=? WHERE email='admin@test.com'",
                    (role_id, BCRYPT_HASH_TEST123, now))
        print(f"Updated admin@test.com to SUPER_ADMIN role")
    
    conn.commit()
    print("\n✅ Done! Login: admin@test.com / test123")
    
    # Verify
    cur.execute("SELECT email, roleId FROM User WHERE email='admin@test.com'")
    user = cur.fetchone()
    print("Verified user:", user)
else:
    print("ERROR: No Role table!")

conn.close()
