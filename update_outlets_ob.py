import re

with open('src/pages/Outlets.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
content = content.replace("import { fetchOutlets, fetchInventory, saveOutlet, deleteOutlet } from '@/src/api';",
                          "import { fetchOutlets, fetchInventory, saveOutlet, deleteOutlet, fetchOrderBookers } from '@/src/api';")

content = content.replace("import { Outlet, InventoryItem } from '@/src/types';",
                          "import { Outlet, InventoryItem, OrderBooker } from '@/src/types';")

# 2. Add state
state_target = "const [inventory, setInventory] = useState<InventoryItem[]>([]);"
state_replacement = "const [inventory, setInventory] = useState<InventoryItem[]>([]);\n  const [orderBookers, setOrderBookers] = useState<OrderBooker[]>([]);"
content = content.replace(state_target, state_replacement)

# 3. Fetch OBs
fetch_target = "const [outletsData, invData] = await Promise.all(["
fetch_replacement = "const [outletsData, invData, obsData] = await Promise.all([\n        fetchOrderBookers(),"
content = content.replace(fetch_target, fetch_replacement)

# Note: The Promise.all array
promise_target = """const [outletsData, invData] = await Promise.all([
        fetchOutlets(),
        fetchInventory()
      ]);
      setOutlets(outletsData);
      setInventory(invData);"""
promise_replacement = """const [outletsData, invData, obsData] = await Promise.all([
        fetchOutlets(),
        fetchInventory(),
        fetchOrderBookers()
      ]);
      setOutlets(outletsData);
      setInventory(invData);
      setOrderBookers(obsData);"""
content = content.replace(promise_target, promise_replacement)

# 4. Replace Input with select
input_target = """<label className="text-xs font-semibold text-gray-600 uppercase">Order Booker (OB)</label>
                  <Input placeholder="Order Booker Name" value={editingOutlet.OB || ''} onChange={e => setEditingOutlet({...editingOutlet, OB: e.target.value})} />"""
input_replacement = """<label className="text-xs font-semibold text-gray-600 uppercase">Order Booker (OB)</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                    value={editingOutlet.OB || ''} 
                    onChange={e => setEditingOutlet({...editingOutlet, OB: e.target.value})}
                  >
                    <option value="">Select Order Booker</option>
                    {orderBookers.map(ob => (
                      <option key={ob.ID} value={ob.Name}>{ob.Name}</option>
                    ))}
                  </select>"""
content = content.replace(input_target, input_replacement)

with open('src/pages/Outlets.tsx', 'w') as f:
    f.write(content)
