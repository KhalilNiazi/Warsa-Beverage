import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { fetchInventory, saveInventoryItem, deleteInventoryItem } from '@/src/api';
import { InventoryItem } from '@/src/types';
import { Plus, Search, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ConfirmDialog } from '@/src/components/ui/confirm-dialog';

export function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<InventoryItem>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchInventory();
      setInventory(data);
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
    if (!editingItem.Name || !editingItem.SKU) return;
    
    const itemToSave = {
      ...editingItem,
      ID: editingItem.ID || Date.now().toString(),
      Quantity: Number(editingItem.Quantity) || 0,
      Price: Number(editingItem.Price) || 0,
      MinThreshold: Number(editingItem.MinThreshold) || 0,
    } as InventoryItem;

    await saveInventoryItem(itemToSave);
    setIsEditing(false);
    setEditingItem({});
    loadData();
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      await deleteInventoryItem(itemToDelete);
      setItemToDelete(null);
      loadData();
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.Name.toLowerCase().includes(search.toLowerCase()) || 
    item.SKU.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Inventory</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Manage your products and stock levels.</p>
        </div>
        <Button onClick={() => { setEditingItem({}); setIsEditing(true); }} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {isEditing && (
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
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit">Save Product</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3 border-b border-gray-100 px-4 md:px-6">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading inventory...</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-medium">Product</th>
                      <th className="px-6 py-4 font-medium">SKU</th>
                      <th className="px-6 py-4 font-medium">Stock</th>
                      <th className="px-6 py-4 font-medium">Price</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No products found.
                        </td>
                      </tr>
                    ) : (
                      filteredInventory.map((item) => (
                        <tr key={item.ID} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{item.Name}</td>
                          <td className="px-6 py-4 text-gray-500">{item.SKU}</td>
                          <td className="px-6 py-4 font-medium">{item.Quantity}</td>
                          <td className="px-6 py-4">PKR {item.Price.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            {item.Quantity <= item.MinThreshold ? (
                              <Badge variant="destructive">Low Stock</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">In Stock</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => { setEditingItem(item); setIsEditing(true); }}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setItemToDelete(item.ID)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden flex flex-col divide-y divide-gray-100">
                {filteredInventory.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No products found.</div>
                ) : (
                  filteredInventory.map((item) => (
                    <div key={item.ID} className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{item.Name}</h3>
                          <p className="text-xs text-gray-500">SKU: {item.SKU}</p>
                        </div>
                        {item.Quantity <= item.MinThreshold ? (
                          <Badge variant="destructive" className="flex items-center gap-1 text-[10px]">
                            <AlertCircle className="h-3 w-3" /> Low
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-[10px]">In Stock</Badge>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-gray-900">PKR {item.Price.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">Stock: <span className="font-medium text-gray-900">{item.Quantity}</span></p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => { setEditingItem(item); setIsEditing(true); }}>
                            <Edit2 className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 hover:text-red-700" onClick={() => setItemToDelete(item.ID)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
