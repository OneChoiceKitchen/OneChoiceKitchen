import os
import re

d = r'apps/admin/admin-portal/src'
count = 0
for r, dirs, files in os.walk(d):
    for f in files:
        if f.endswith(('.tsx', '.ts')):
            path = os.path.join(r, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            new_content = re.sub(r'http://localhost:[34]000/api', '/api', content)
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                count += 1
                print(f'Updated {path}')
print(f'Total files updated: {count}')
