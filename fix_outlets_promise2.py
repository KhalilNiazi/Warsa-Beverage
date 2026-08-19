import re

with open('src/pages/Outlets.tsx', 'r') as f:
    content = f.read()

target = """const [obsData, outletsData, invData] = await Promise.all([
        fetchOrderBookers(),
        fetchOutlets(),
        fetchInventory()
      ]);
      setOutlets(outletsData);
      setInventory(invData);"""

replacement = """const [obsData, outletsData, invData] = await Promise.all([
        fetchOrderBookers(),
        fetchOutlets(),
        fetchInventory()
      ]);
      setOutlets(outletsData);
      setInventory(invData);
      setOrderBookers(obsData);"""

content = content.replace(target, replacement)

with open('src/pages/Outlets.tsx', 'w') as f:
    f.write(content)
