import re

with open('src/api.ts', 'r') as f:
    content = f.read()

content = content.replace("const MOCK_INVENTORY_KEY = 'warsa_mock_inventory';", "const MOCK_INVENTORY_KEY = 'warsa_mock_inventory_empty';")

target_inv = """  const initial = [
    { ID: '1', Name: '300ML(24B)', SKU: 'WARSA-300-24', Quantity: 1200, Price: 0, MinThreshold: 100 },
    { ID: '2', Name: '300ML(16B)', SKU: 'WARSA-300-16', Quantity: 800, Price: 0, MinThreshold: 100 },
    { ID: '3', Name: '500 ML', SKU: 'WARSA-500', Quantity: 500, Price: 370, MinThreshold: 50 },
    { ID: '4', Name: '1500 ML', SKU: 'WARSA-1500', Quantity: 200, Price: 370, MinThreshold: 20 },
    { ID: '5', Name: '5. LITER', SKU: 'WARSA-5L', Quantity: 400, Price: 0, MinThreshold: 50 },
    { ID: '6', Name: '19.LITER', SKU: 'WARSA-19L', Quantity: 300, Price: 0, MinThreshold: 30 },
    { ID: '7', Name: 'PROMO 500 ml', SKU: 'WARSA-PROMO-500', Quantity: 100, Price: 0, MinThreshold: 10 },
  ];"""
replacement_inv = """  const initial: InventoryItem[] = [];"""

content = content.replace(target_inv, replacement_inv)

with open('src/api.ts', 'w') as f:
    f.write(content)
