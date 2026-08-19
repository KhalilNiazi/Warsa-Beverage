import re

with open('src/pages/OrderBookers.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace("import { User, Plus, Edit, Trash2 } from 'lucide-react';",
                          "import { User, Plus, Edit, Trash2 } from 'lucide-react';\nimport { ResponsiveDialog } from '@/src/components/ui/responsive-dialog';")

target = """      {isEditing && (
        <Card className="border-slate-200/60 shadow-md">
          <CardHeader>
            <CardTitle>{editingOB.ID ? 'Edit Order Booker' : 'Add New Order Booker'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Name</label>
                  <Input required placeholder="Order Booker Name" value={editingOB.Name || ''} onChange={e => setEditingOB({...editingOB, Name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Phone Number</label>
                  <Input placeholder="Phone Number" value={editingOB.Phone || ''} onChange={e => setEditingOB({...editingOB, Phone: e.target.value})} />
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
        title={editingOB.ID ? 'Edit Order Booker' : 'Add New Order Booker'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Name</label>
              <Input required placeholder="Order Booker Name" value={editingOB.Name || ''} onChange={e => setEditingOB({...editingOB, Name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Phone Number</label>
              <Input placeholder="Phone Number" value={editingOB.Phone || ''} onChange={e => setEditingOB({...editingOB, Phone: e.target.value})} />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </ResponsiveDialog>"""

content = content.replace(target, replacement)

with open('src/pages/OrderBookers.tsx', 'w') as f:
    f.write(content)
