import re

with open('src/pages/Outlets.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace("import { Store, Plus, Search, Edit, Trash2 } from 'lucide-react';",
                          "import { Store, Plus, Search, Edit, Trash2 } from 'lucide-react';\nimport { ResponsiveDialog } from '@/src/components/ui/responsive-dialog';")

target = """      {isEditing && (
        <Card className="border-slate-200/60 shadow-md">
          <CardHeader>
            <CardTitle>{editingOutlet.ID ? 'Edit Outlet' : 'Add New Outlet'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Outlet Code</label>
                  <Input required placeholder="Outlet Code" value={editingOutlet.Code || ''} onChange={e => setEditingOutlet({...editingOutlet, Code: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Outlet Name</label>
                  <Input required placeholder="Outlet Name" value={editingOutlet.Name || ''} onChange={e => setEditingOutlet({...editingOutlet, Name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Route</label>
                  <Input placeholder="Route" value={editingOutlet.Route || ''} onChange={e => setEditingOutlet({...editingOutlet, Route: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Address</label>
                  <Input placeholder="Address" value={editingOutlet.Address || ''} onChange={e => setEditingOutlet({...editingOutlet, Address: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Contact Number</label>
                  <Input placeholder="Contact" value={editingOutlet.ContactNumber || ''} onChange={e => setEditingOutlet({...editingOutlet, ContactNumber: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Order Booker (OB)</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                    value={editingOutlet.OB || ''} 
                    onChange={e => setEditingOutlet({...editingOutlet, OB: e.target.value})}
                  >
                    <option value="">Select Order Booker</option>
                    {orderBookers.map(ob => (
                      <option key={ob.ID} value={ob.Name}>{ob.Name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Opening Balance (Rs)</label>
                  <Input type="number" placeholder="0" value={editingOutlet.OpeningBalance || ''} onChange={e => setEditingOutlet({...editingOutlet, OpeningBalance: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Owner Name</label>
                  <Input placeholder="Owner" value={editingOutlet.OwnerName || ''} onChange={e => setEditingOutlet({...editingOutlet, OwnerName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Status / Type</label>
                  <Input placeholder="Status" value={editingOutlet.Status || ''} onChange={e => setEditingOutlet({...editingOutlet, Status: e.target.value})} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Custom Rates (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg">
                  {inventory.map(item => (
                    <div key={item.ID} className="flex flex-col gap-1 bg-white p-3 rounded shadow-sm border border-gray-100">
                      <span className="text-xs font-medium text-gray-700">{item.Name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Rs.</span>
                        <Input 
                          type="number" 
                          placeholder={item.Price.toString()}
                          className="h-8 text-sm"
                          value={editingOutlet.CustomRates?.[item.ID] || ''} 
                          onChange={e => {
                            const val = e.target.value ? Number(e.target.value) : undefined;
                            const newRates = { ...(editingOutlet.CustomRates || {}) };
                            if (val !== undefined) newRates[item.ID] = val;
                            else delete newRates[item.ID];
                            setEditingOutlet({...editingOutlet, CustomRates: newRates});
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
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
        title={editingOutlet.ID ? 'Edit Outlet' : 'Add New Outlet'}
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Outlet Code</label>
              <Input required placeholder="Outlet Code" value={editingOutlet.Code || ''} onChange={e => setEditingOutlet({...editingOutlet, Code: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Outlet Name</label>
              <Input required placeholder="Outlet Name" value={editingOutlet.Name || ''} onChange={e => setEditingOutlet({...editingOutlet, Name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Route</label>
              <Input placeholder="Route" value={editingOutlet.Route || ''} onChange={e => setEditingOutlet({...editingOutlet, Route: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Address</label>
              <Input placeholder="Address" value={editingOutlet.Address || ''} onChange={e => setEditingOutlet({...editingOutlet, Address: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Contact Number</label>
              <Input placeholder="Contact" value={editingOutlet.ContactNumber || ''} onChange={e => setEditingOutlet({...editingOutlet, ContactNumber: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Order Booker (OB)</label>
              <select 
                className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                value={editingOutlet.OB || ''} 
                onChange={e => setEditingOutlet({...editingOutlet, OB: e.target.value})}
              >
                <option value="">Select Order Booker</option>
                {orderBookers.map(ob => (
                  <option key={ob.ID} value={ob.Name}>{ob.Name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Opening Balance (Rs)</label>
              <Input type="number" placeholder="0" value={editingOutlet.OpeningBalance || ''} onChange={e => setEditingOutlet({...editingOutlet, OpeningBalance: Number(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Owner Name</label>
              <Input placeholder="Owner" value={editingOutlet.OwnerName || ''} onChange={e => setEditingOutlet({...editingOutlet, OwnerName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Status / Type</label>
              <Input placeholder="Status" value={editingOutlet.Status || ''} onChange={e => setEditingOutlet({...editingOutlet, Status: e.target.value})} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Custom Rates (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg">
              {inventory.map(item => (
                <div key={item.ID} className="flex flex-col gap-1 bg-white p-3 rounded shadow-sm border border-gray-100">
                  <span className="text-xs font-medium text-gray-700">{item.Name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Rs.</span>
                    <Input 
                      type="number" 
                      placeholder={item.Price.toString()}
                      className="h-8 text-sm"
                      value={editingOutlet.CustomRates?.[item.ID] || ''} 
                      onChange={e => {
                        const val = e.target.value ? Number(e.target.value) : undefined;
                        const newRates = { ...(editingOutlet.CustomRates || {}) };
                        if (val !== undefined) newRates[item.ID] = val;
                        else delete newRates[item.ID];
                        setEditingOutlet({...editingOutlet, CustomRates: newRates});
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </ResponsiveDialog>"""

content = content.replace(target, replacement)

with open('src/pages/Outlets.tsx', 'w') as f:
    f.write(content)
