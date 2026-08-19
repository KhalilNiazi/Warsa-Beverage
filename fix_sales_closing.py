import re

with open('src/pages/Sales.tsx', 'r') as f:
    content = f.read()

content = content.replace('''      </ResponsiveDialog>\n      )}''', '''      </ResponsiveDialog>''')

with open('src/pages/Sales.tsx', 'w') as f:
    f.write(content)
