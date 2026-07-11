import re

with open(r'c:\Users\priyer\.gemini\antigravity-ide\scratch\restaurant-saas\prisma\schema.prisma', 'r', encoding='utf-8') as f:
    schema = f.read()

# Replace @default(VALUE) with @default("VALUE") where VALUE is not a number, true/false, uuid(), or now()
def add_quotes(match):
    val = match.group(1)
    if val in ['uuid()', 'now()', 'true', 'false'] or val.isdigit() or val.startswith('"'):
        return match.group(0)
    return f'@default("{val}")'

schema = re.sub(r'@default\(([a-zA-Z0-9_]+)\)', add_quotes, schema)

with open(r'c:\Users\priyer\.gemini\antigravity-ide\scratch\restaurant-saas\prisma\schema.prisma', 'w', encoding='utf-8') as f:
    f.write(schema)

print("Fixed default values in Prisma schema")
