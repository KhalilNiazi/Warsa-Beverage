import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("2 Abbot Road Lahore", "40-1 Saddar Bazar Lahore")

with open('src/App.tsx', 'w') as f:
    f.write(content)
