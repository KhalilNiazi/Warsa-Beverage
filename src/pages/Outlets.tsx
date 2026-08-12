import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { fetchOutlets, fetchInventory, saveOutlet, deleteOutlet } from '@/src/api';
import { Outlet, InventoryItem } from '@/src/types';
import { Store, Plus, Search, Edit, Trash2 } from 'lucide-react';

export function Outlets() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');

  const [editingOutlet, setEditingOutlet] = useState<Partial<Outlet>>({
    CustomRates: {}
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [outletsData, invData] = await Promise.all([
        fetchOutlets(),
        fetchInventory()
      ]);
      setOutlets(outletsData);
      setInventory(invData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOutlet.Name) return;
    
    const outletToSave = {
      ...editingOutlet,
      ID: editingOutlet.ID || Date.now().toString(),
      Code: editingOutlet.Code || '',
      Name: editingOutlet.Name || '',
      Route: editingOutlet.Route || '',
      Address: editingOutlet.Address || '',
      ContactNumber: editingOutlet.ContactNumber || '',
      OwnerName: editingOutlet.OwnerName || '',
      OB: editingOutlet.OB || '',
      OpeningBalance: Number(editingOutlet.OpeningBalance) || 0,
      Status: editingOutlet.Status || '',
      CustomRates: editingOutlet.CustomRates || {}
    } as Outlet;

    await saveOutlet(outletToSave);
    setIsEditing(false);
    setEditingOutlet({ CustomRates: {} });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this outlet?')) {
      await deleteOutlet(id);
      loadData();
    }
  };

  const handleRateChange = (productId: string, price: string) => {
    setEditingOutlet(prev => ({
      ...prev,
      CustomRates: {
        ...prev.CustomRates,
        [productId]: Number(price)
      }
    }));
  };

  const filteredOutlets = outlets.filter(o => 
    (o.Name || '').toLowerCase().includes(search.toLowerCase()) || 
    (o.Code || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.Route || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Outlets</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Manage your customers and custom pricing.</p>
        </div>
        <Button onClick={() => { setEditingOutlet({ CustomRates: {} }); setIsEditing(true); }} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Add Outlet
        </Button>
      </div>

      {isEditing && (
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
                  <Input placeholder="Order Booker Name" value={editingOutlet.OB || ''} onChange={e => setEditingOutlet({...editingOutlet, OB: e.target.value})} />
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
                  <Input placeholder="e.g. General trader" value={editingOutlet.Status || ''} onChange={e => setEditingOutlet({...editingOutlet, Status: e.target.value})} />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-semibold text-gray-900 mb-4">Custom Rates (PKR)</h3>
                <p className="text-xs text-gray-500 mb-4">Leave blank to use the default inventory price.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inventory.map(item => (
                    <div key={item.ID} className="flex flex-col space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <label className="text-sm font-medium text-gray-700">{item.Name}</label>
                      <div className="text-xs text-gray-500 mb-2">Default: PKR {item.Price}</div>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder={`Custom rate...`}
                        value={editingOutlet.CustomRates?.[item.ID] || ''}
                        onChange={e => handleRateChange(item.ID, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit">Save Outlet</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3 border-b border-gray-100 px-4 md:px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <CardTitle className="text-lg">Outlet Directory</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name, code, or route..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading outlets...</div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {filteredOutlets.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No outlets found.</div>
              ) : (
                filteredOutlets.map((outlet) => (
                  <div 
                    key={outlet.ID} 
                    className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => { setEditingOutlet(outlet); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >
                    <div className="flex gap-3 items-center">
                      <div className="bg-red-50 p-2 rounded-full flex-shrink-0">
                        <Store className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{outlet.Code} - {outlet.Name}</p>
                        <p className="text-sm text-gray-500">{outlet.Route} {outlet.Address ? `• ${outlet.Address}` : ''}</p>
                        <div className="flex gap-2 mt-1">
                          {Object.keys(outlet.CustomRates || {}).length > 0 && (
                            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10">
                              {Object.keys(outlet.CustomRates || {}).length} Custom Rates
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{outlet.Status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 self-end sm:self-auto">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingOutlet(outlet); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={(e) => { e.stopPropagation(); handleDelete(outlet.ID); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
