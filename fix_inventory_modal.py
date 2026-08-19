import re

with open('src/pages/Inventory.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace("import { Package, Plus, Search, Edit, Trash2, AlertCircle } from 'lucide-react';",
                          "import { Package, Plus, Search, Edit, Trash2, AlertCircle } from 'lucide-react';\nimport { ResponsiveDialog } from '@/src/components/ui/responsive-dialog';")

target = """      {isEditing && (
        <Card className="border-slate-200/60 shadow-md">
          <CardHeader>
            <CardTitle>{editingItem.ID ? 'Edit Product' : 'Add New Product'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Name</label>
                  <Input 
                    required 
                    value={editingItem.Name || ''} 
                    onChange={e => setEditingItem({...editingItem, Name: e.target.value})}
                    placeholder="e.g. 500ml Bottle"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SKU</label>
                  <Input 
                    required 
                    value={editingItem.SKU || ''} 
                    onChange={e => setEditingItem({...editingItem, SKU: e.target.value})}
                    placeholder="e.g. WARSA-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Quantity</label>
                  <Input 
                    type="number" 
                    required 
                    min="0"
                    value={editingItem.Quantity ?? ''} 
                    onChange={e => setEditingItem({...editingItem, Quantity: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (PKR)</label>
                  <Input 
                    type="number" 
                    required 
                    min="0" step="0.01"
                    value={editingItem.Price ?? ''} 
                    onChange={e => setEditingItem({...editingItem, Price: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Low Stock Threshold</label>
                  <Input 
                    type="number" 
                    required 
                    min="0"
                    value={editingItem.MinThreshold ?? ''} 
                    onChange={e => setEditingItem({...editingItem, MinThreshold: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}"""

replacement = """      <ResponsiveDialog 
        isOpen={isEditing} 
        onClose={() => setIsEditing(false)} 
        title={editingItem.ID ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Product Name</label>
              <Input 
                required 
                value={editingItem.Name || ''} 
                onChange={e => setEditingItem({...editingItem, Name: e.target.value})}
                placeholder="e.g. 500ml Bottle"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">SKU</label>
              <Input 
                required 
                value={editingItem.SKU || ''} 
                onChange={e => setEditingItem({...editingItem, SKU: e.target.value})}
                placeholder="e.g. WARSA-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Current Quantity</label>
              <Input 
                type="number" 
                required 
                min="0"
                value={editingItem.Quantity ?? ''} 
                onChange={e => setEditingItem({...editingItem, Quantity: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Price (PKR)</label>
              <Input 
                type="number" 
                required 
                min="0" step="0.01"
                value={editingItem.Price ?? ''} 
                onChange={e => setEditingItem({...editingItem, Price: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Low Stock Threshold</label>
              <Input 
                type="number" 
                required 
                min="0"
                value={editingItem.MinThreshold ?? ''} 
                onChange={e => setEditingItem({...editingItem, MinThreshold: Number(e.target.value)})}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </ResponsiveDialog>"""

content = content.replace(target, replacement)

with open('src/pages/Inventory.tsx', 'w') as f:
    f.write(content)
