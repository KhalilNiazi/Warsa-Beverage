import re

with open('src/pages/Outlets.tsx', 'r') as f:
    content = f.read()

target = """const [outletsData, invData, obsData] = await Promise.all([
        fetchOrderBookers(),
        fetchOutlets(),
        fetchInventory()
      ]);"""

replacement = """const [obsData, outletsData, invData] = await Promise.all([
        fetchOrderBookers(),
        fetchOutlets(),
        fetchInventory()
      ]);"""

content = content.replace(target, replacement)

with open('src/pages/Outlets.tsx', 'w') as f:
    f.write(content)
