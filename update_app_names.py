with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('WARSA PURE WATER', 'KFM Beverages (WARSA)')
content = content.replace('<span className="font-bold text-xl leading-none tracking-wider">WARSA</span>', '<span className="font-bold text-lg leading-none tracking-wider text-center">KFM Beverages<br/>(WARSA)</span>')

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/pages/DailyReport.tsx', 'r') as f:
    content = f.read()

content = content.replace('WARSA PURE WATER', 'KFM Beverages (WARSA)')

with open('src/pages/DailyReport.tsx', 'w') as f:
    f.write(content)
