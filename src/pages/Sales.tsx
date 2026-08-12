import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { fetchInventory, fetchSales, addSaleRecord, fetchOutlets } from '@/src/api';
import { InventoryItem, SaleRecord, Outlet, InvoiceItem } from '@/src/types';
import { ShoppingCart, Search, Receipt, Plus, Trash2, FileText, ChevronDown, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/src/lib/utils';
import { InvoiceDetailModal } from '@/src/components/InvoiceDetailModal';

import { PrintOrderView } from '@/src/components/PrintOrderView';

export function Sales() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [search, setSearch] = useState('');
  
  const [printSale, setPrintSale] = useState<SaleRecord | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<SaleRecord | null>(null);

  // Order form state
  const [selectedOutletId, setSelectedOutletId] = useState('');
  const [outletName, setOutletName] = useState('');
  const [route, setRoute] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [status, setStatus] = useState('');
  
  const [orderItems, setOrderItems] = useState<{product: string, qty: number}[]>([]);
  const [discount, setDiscount] = useState<number>(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invData, salesData, outletsData] = await Promise.all([
        fetchInventory(),
        fetchSales(),
        fetchOutlets()
      ]);
      setInventory(invData);
      setOutlets(outletsData);
      setSales(salesData.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime()));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (printSale) {
      const timer = setTimeout(() => {
        try { window.print(); } catch(e) {}
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [printSale]);

  useEffect(() => {
    const handleAfterPrint = () => {
      setTimeout(() => setPrintSale(null), 1000);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handleOutletSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedOutletId(id);
    const outlet = outlets.find(o => o.ID === id);
    if (outlet) {
      setOutletName(outlet.Name);
      setRoute(outlet.Route);
      setAddress(outlet.Address);
      setContactNumber(outlet.ContactNumber);
      setOwnerName(outlet.OwnerName);
      setStatus(outlet.Status);
    } else {
      setOutletName('');
      setRoute('');
      setAddress('');
      setContactNumber('');
      setOwnerName('');
      setStatus('');
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { product: '', qty: 1 }]);
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = orderItems.filter((_, i) => i !== index);
    setOrderItems(updated);
  };

  // Compute Totals
  const selectedOutlet = outlets.find(o => o.ID === selectedOutletId);
  const resolvedItems: InvoiceItem[] = orderItems.map(item => {
    const p = inventory.find(i => i.ID === item.product);
    
    let price = p?.Price || 0;
    // Apply custom rate if available
    if (selectedOutlet && selectedOutlet.CustomRates && selectedOutlet.CustomRates[item.product] !== undefined) {
      price = selectedOutlet.CustomRates[item.product];
    }
    
    const name = p?.Name || '';
    return {
      ProductID: item.product,
      ProductName: name,
      Quantity: Number(item.qty),
      Price: price,
      Amount: price * Number(item.qty)
    };
  }).filter(item => item.ProductID); // Only valid items

  const totalCases = resolvedItems.reduce((acc, item) => acc + item.Quantity, 0);
  const totalAmount = resolvedItems.reduce((acc, item) => acc + item.Amount, 0);
  const grandTotal = totalAmount - (Number(discount) || 0);

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resolvedItems.length === 0) {
      alert("Please add at least one valid product.");
      return;
    }

    const sale: SaleRecord = {
      ID: Math.floor(Math.random() * 100000).toString(), // Mock Order #
      Date: new Date().toISOString(),
      OutletName: outletName,
      Route: route,
      Address: address,
      ContactNumber: contactNumber,
      OwnerName: ownerName,
      Status: status,
      Items: resolvedItems,
      TotalCases: totalCases,
      TotalAmount: totalAmount,
      Discount: Number(discount) || 0,
      GrandTotal: grandTotal,
    };

    setIsRecording(false);
    await addSaleRecord(sale);
    // Reset form
    setSelectedOutletId('');
    setOutletName('');
    setRoute('');
    setAddress('');
    setContactNumber('');
    setOwnerName('');
    setStatus('');
    setOrderItems([]);
    setDiscount(0);
    loadData();
  };

  const filteredSales = sales.filter(sale => 
    (sale.OutletName || '').toLowerCase().includes(search.toLowerCase()) || 
    (sale.ID || '').toLowerCase().includes(search.toLowerCase())
  );

  const [showIframeWarning, setShowIframeWarning] = useState(false);

  const triggerPrint = (sale: SaleRecord) => {
    if (window.self !== window.top) {
      setShowIframeWarning(true);
    }
    setPrintSale(sale);
  };

  return (
    <>
      <PrintOrderView sale={printSale} outlets={outlets} />
      
      {showIframeWarning && (
        <div className="bg-amber-100 text-amber-800 p-4 rounded-md mb-4 max-w-7xl mx-auto flex justify-between items-center print:hidden text-sm">
          <p><strong>Note:</strong> If the print dialog didn't open, it's because the preview window blocks popups. Please click the <strong>"Open in New Tab"</strong> icon at the top right of the screen to print.</p>
          <Button variant="ghost" size="sm" onClick={() => setShowIframeWarning(false)}>Dismiss</Button>
        </div>
      )}

      <div className={cn("p-4 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-6", printSale ? "print:hidden" : "")}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Orders Booked</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">Generate and view Warsa Pure Water orders.</p>
          </div>
          <Button onClick={() => { setIsRecording(true); if(orderItems.length===0) handleAddItem(); }} className="gap-2 w-full sm:w-auto">
            <FileText className="h-4 w-4" /> Add Order
          </Button>
        </div>

        {isRecording && (
          <Card className="border-slate-200/60 shadow-md">
            <CardHeader>
              <CardTitle>New Order</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRecordSale} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Select Outlet / Customer</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    value={selectedOutletId}
                    onChange={handleOutletSelect}
                  >
                    <option value="">-- Custom (No Saved Outlet) --</option>
                    {outlets.map(o => (
                      <option key={o.ID} value={o.ID}>[{o.Code || '-'}] {o.Name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Outlet Name</label>
                    <Input required placeholder="e.g. AA ENTERPRISES" value={outletName} onChange={e => setOutletName(e.target.value)} disabled={!!selectedOutletId} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Status / Type</label>
                    <Input placeholder="e.g. General trader" value={status} onChange={e => setStatus(e.target.value)} disabled={!!selectedOutletId} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Route</label>
                    <Input placeholder="e.g. RAILWAY + G SHAHU" value={route} onChange={e => setRoute(e.target.value)} disabled={!!selectedOutletId} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Address</label>
                    <Input placeholder="e.g. RAILWAY STATION" value={address} onChange={e => setAddress(e.target.value)} disabled={!!selectedOutletId} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Contact Number</label>
                    <Input placeholder="e.g. 0336-4574227" value={contactNumber} onChange={e => setContactNumber(e.target.value)} disabled={!!selectedOutletId} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Owner Name</label>
                    <Input placeholder="e.g. SHARJEEL SB" value={ownerName} onChange={e => setOwnerName(e.target.value)} disabled={!!selectedOutletId} />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Items</h3>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="gap-1">
                      <Plus className="h-4 w-4" /> Add Item
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {orderItems.map((item, idx) => {
                       return (
                        <div key={idx} className="flex flex-col sm:flex-row gap-3 items-end">
                          <div className="w-full sm:flex-1 space-y-2">
                            <label className="text-xs font-medium text-gray-500">Product</label>
                            <select 
                              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                              value={item.product}
                              onChange={e => handleUpdateItem(idx, 'product', e.target.value)}
                              required
                            >
                              <option value="" disabled>Select product...</option>
                              {inventory.map(invItem => {
                                let optPrice = invItem.Price;
                                if (selectedOutlet && selectedOutlet.CustomRates && selectedOutlet.CustomRates[invItem.ID] !== undefined) {
                                  optPrice = selectedOutlet.CustomRates[invItem.ID];
                                }
                                return (
                                  <option key={invItem.ID} value={invItem.ID}>
                                    {invItem.Name} (PKR {optPrice.toFixed(2)})
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                          <div className="w-full sm:w-32 space-y-2">
                            <label className="text-xs font-medium text-gray-500">Quantity (Cases)</label>
                            <Input 
                              type="number" 
                              min="1"
                              required
                              value={item.qty}
                              onChange={e => handleUpdateItem(idx, 'qty', Number(e.target.value))}
                            />
                          </div>
                          <div className="w-full sm:w-auto">
                            <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveItem(idx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {orderItems.length === 0 && (
                      <div className="text-center p-4 text-sm text-gray-500 bg-gray-50 rounded-lg">No items added.</div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <div className="w-full sm:w-72 space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Total Cases:</span>
                      <span className="font-semibold text-gray-900">{totalCases}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Total Amount:</span>
                      <span className="font-semibold text-gray-900">PKR {totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Discount (PKR):</span>
                      <Input 
                        type="number" 
                        min="0"
                        className="w-24 h-8 text-right"
                        value={discount || ''}
                        onChange={e => setDiscount(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-slate-200">
                      <span>Grand Total:</span>
                      <span>PKR {grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-6">
                  <Button type="button" variant="outline" onClick={() => setIsRecording(false)}>Cancel</Button>
                  <Button type="submit" disabled={resolvedItems.length === 0}>Save Order</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3 border-b border-gray-100 px-4 md:px-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <CardTitle className="text-lg">Recent Orders Booked</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by outlet or invoice..."
                  className="pl-9 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading orders...</div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto print:overflow-visible print:block">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-medium">Inv #</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                        <th className="px-6 py-4 font-medium">Outlet</th>
                        <th className="px-6 py-4 font-medium">Cases</th>
                        <th className="px-6 py-4 font-medium text-right">Grand Total</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSales.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            No orders found.
                          </td>
                        </tr>
                      ) : (
                        filteredSales.map((sale) => (
                          <tr key={sale.ID} onClick={() => setSelectedInvoice(sale)} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer">
                            <td className="px-6 py-4 font-medium text-red-600 hover:underline">#{sale.ID}</td>
                            <td className="px-6 py-4 text-gray-500">{format(new Date(sale.Date), 'MMM dd, yyyy h:mm a')}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{sale.OutletName}</td>
                            <td className="px-6 py-4">{sale.TotalCases}</td>
                            <td className="px-6 py-4 font-bold text-right">PKR {(sale.GrandTotal || 0).toFixed(2)}</td>
                            <td className="px-6 py-4 text-right">
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); triggerPrint(sale); }}>
                                <Printer className="h-4 w-4 text-red-600" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden flex flex-col divide-y divide-gray-100">
                  {filteredSales.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No orders found.</div>
                  ) : (
                    filteredSales.map((sale) => (
                      <div key={sale.ID} onClick={() => setSelectedInvoice(sale)} className="p-4 flex gap-3 items-center cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="bg-red-50 p-2 rounded-full flex-shrink-0">
                          <Receipt className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{sale.OutletName}</p>
                          <p className="text-xs text-gray-500 font-medium text-red-600">Inv #{sale.ID} • {format(new Date(sale.Date), 'MMM dd, h:mm a')}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-gray-900">PKR {(sale.GrandTotal || 0).toFixed(2)}</p>
                          <Button variant="ghost" size="icon" className="h-8 w-8 mt-1" onClick={(e) => { e.stopPropagation(); triggerPrint(sale); }}>
                            <Printer className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedInvoice && (
        <InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </>
  );
}
