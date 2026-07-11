import re

with open(r'c:\Users\priyer\.gemini\antigravity-ide\scratch\restaurant-saas\prisma\schema.prisma', 'r', encoding='utf-8') as f:
    schema = f.read()

# Replace Enum usages with String
enums = ['UserRole', 'MealType', 'DietType', 'SubscriptionStatus', 'DeliveryStatus', 'InvoiceStatus', 'CommentStatus']
for enum_name in enums:
    schema = re.sub(rf'\b{enum_name}\b', 'String', schema)

# Remove Enum blocks entirely
schema = re.sub(r'enum\s+String\s+\{.*?(?=\n\})\}', '', schema, flags=re.DOTALL)
schema = re.sub(r'enum\s+String\s+\{[^\}]+\}', '', schema, flags=re.DOTALL)
schema = re.sub(r'enum\s+[A-Za-z]+\s+\{[^\}]+\}', '', schema, flags=re.DOTALL)

with open(r'c:\Users\priyer\.gemini\antigravity-ide\scratch\restaurant-saas\prisma\schema.prisma', 'w', encoding='utf-8') as f:
    f.write(schema)

print("Schema updated for SQLite")
