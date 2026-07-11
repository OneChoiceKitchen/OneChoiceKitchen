import sys

path = r'c:\Users\priyer\.gemini\antigravity-ide\scratch\restaurant-saas\apps\web\app\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('id="tiffin"')
if start_idx != -1:
    with open('output_tiffin.txt', 'w', encoding='utf-8') as out:
        out.write(content[start_idx-100:start_idx+6500])
else:
    print('Not found')
