import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { fetchOutlets, fetchSales, fetchPayments, addPaymentRecord } from '@/src/api';
import { Outlet, SaleRecord, PaymentRecord } from '@/src/types';
import { BookOpen, Search, Plus, DollarSign, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { InvoiceDetailModal } from '@/src/components/InvoiceDetailModal';
import { PaymentDetailModal } from '@/src/components/PaymentDetailModal';

type LedgerEntry = {
  id: string;
  date: string;
  type: 'SALE' | 'PAYMENT';
  description: string;
  credit: number; // Sale (increases what they owe)
  debit: number; // Payment (decreases what they owe)
  balance: number;
};

export function Ledger() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOutletId, setSelectedOutletId] = useState<string>('');
  const [searchOutlet, setSearchOutlet] = useState('');
  
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'RECEIPT' | 'RETURN'>('RECEIPT');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedOutlets, fetchedSales, fetchedPayments] = await Promise.all([
        fetchOutlets(),
        fetchSales(),
        fetchPayments()
      ]);
      setOutlets(fetchedOutlets);
      setSales(fetchedSales);
      setPayments(fetchedPayments);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddPayment = async () => {
    if (!selectedOutletId || !paymentAmount) return;
    
    try {
      const newPayment: PaymentRecord = {
        ID: `PAY-${Date.now()}`,
        Date: new Date().toISOString(),
        OutletID: selectedOutletId,
        Amount: Number(paymentAmount),
        Notes: paymentNotes
      };
      
      await addPaymentRecord(newPayment);
      
      setPaymentAmount('');
      setPaymentNotes('');
      setIsAddingPayment(false);
      loadData();
    } catch (error) {
      console.error("Error adding payment", error);
      alert("Failed to add payment.");
    }
  };

  const selectedOutlet = outlets.find(o => o.ID === selectedOutletId);

  // Generate Ledger Entries
  let ledgerEntries: LedgerEntry[] = [];
  let currentBalance = selectedOutlet?.OpeningBalance || 0;
  
  if (selectedOutlet) {
    const outletSales = sales.filter(s => s.OutletName === selectedOutlet.Name); // Using Name to match sales since SaleRecord doesn't save OutletID strictly, wait, SaleRecord saves OutletName. Let's make sure.
    const outletPayments = payments.filter(p => p.OutletID === selectedOutlet.ID);
    
    const combined: Array<{ date: string, type: 'SALE' | 'PAYMENT', data: any }> = [
      ...outletSales.map(s => ({ date: s.Date, type: 'SALE' as const, data: s })),
      ...outletPayments.map(p => ({ date: p.Date, type: 'PAYMENT' as const, data: p }))
    ];
    
    // Sort by Date ascending
    combined.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    combined.forEach(entry => {
      if (entry.type === 'SALE') {
        const sale = entry.data as SaleRecord;
        currentBalance += sale.GrandTotal;
        ledgerEntries.push({
          id: sale.ID,
          date: sale.Date,
          type: 'SALE',
          description: `Invoice #${sale.ID}`,
          credit: sale.GrandTotal, // Amount added to their debt
          debit: 0,
          balance: currentBalance
        });
      } else {
        const payment = entry.data as PaymentRecord;
        if (payment.Type === 'RETURN') {
          currentBalance += payment.Amount;
        } else {
          currentBalance -= payment.Amount;
        }
        ledgerEntries.push({
          id: payment.ID,
          date: payment.Date,
          type: 'PAYMENT',
          description: payment.Notes || (payment.Type === 'RETURN' ? 'Cash Return' : 'Cash Receipt'),
          credit: payment.Type === 'RETURN' ? payment.Amount : 0,
          debit: payment.Type === 'RETURN' ? 0 : payment.Amount, // Amount reducing their debt
          balance: currentBalance
        });
      }
    });
    
    // Reverse to show newest first
    ledgerEntries.reverse();
  }

  // Calculate Lifetime cases for this outlet
  let lifetimeCases: Record<string, number> = {};
  if (selectedOutlet) {
    const outletSales = sales.filter(s => s.OutletName === selectedOutlet.Name);
    outletSales.forEach(sale => {
      sale.Items.forEach(item => {
        lifetimeCases[item.ProductName] = (lifetimeCases[item.ProductName] || 0) + item.Quantity;
      });
    });
  }

  const filteredOutlets = outlets.filter(o => 
    o.Name.toLowerCase().includes(searchOutlet.toLowerCase())
  );

  const selectedInvoice = sales.find(s => s.ID === selectedInvoiceId);
  const selectedPayment = payments.find(p => p.ID === selectedPaymentId);

  return (
    <div className={`p-4 md:p-8 max-w-7xl mx-auto space-y-6 ${selectedOutletId ? 'pt-2 md:pt-8' : ''}`}>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${selectedOutletId ? 'hidden md:flex' : 'flex'}`}>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Customer Ledger</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Track sales, payments, and outstanding balances.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar: Outlet Selection */}
        <div className={`md:col-span-1 ${selectedOutletId ? 'hidden md:block' : 'block'}`}>
          <Card className="h-[calc(100vh-200px)] flex flex-col">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-lg">Select Customer</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search customers..."
                  className="pl-9 h-9"
                  value={searchOutlet}
                  onChange={(e) => setSearchOutlet(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1 no-scrollbar">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredOutlets.map(outlet => (
                    <button
                      key={outlet.ID}
                      onClick={() => setSelectedOutletId(outlet.ID)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedOutletId === outlet.ID ? 'bg-red-50 border-l-4 border-red-600' : ''}`}
                    >
                      <div className="font-semibold text-gray-900 text-sm">{outlet.Name}</div>
                      <div className="text-xs text-gray-500 mt-1">{outlet.Route}</div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Ledger View */}
        <div className={`md:col-span-2 flex-col gap-6 ${!selectedOutletId ? 'hidden md:flex' : 'flex'}`}>
          {!selectedOutlet ? (
            <Card className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
              <p>Select a customer from the list to view their ledger.</p>
            </Card>
          ) : (
            <>
              {/* Mobile Back Button & Customer Header */}
              <div className="flex flex-col gap-2 mb-2">
                <div className="md:hidden">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedOutletId('')} className="px-0 text-red-600 hover:bg-transparent hover:text-red-700 -ml-2">
                    &larr; Back to Customers
                  </Button>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">{selectedOutlet.Name}</h2>
                  <p className="text-sm text-gray-500">{selectedOutlet.Route}</p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-white">
                  <CardContent className="p-4 flex flex-col justify-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Current Balance</span>
                    <span className={`text-2xl font-bold mt-1 ${currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Rs {currentBalance.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      {currentBalance > 0 ? 'To be collected' : (currentBalance < 0 ? 'Advance' : 'Settled')}
                    </span>
                  </CardContent>
                </Card>
                <Card className="bg-red-600 text-white">
                  <CardContent className="p-4 flex flex-col justify-center h-full">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold">Record Payment</span>
                      <Wallet className="h-5 w-5 opacity-80" />
                    </div>
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="secondary" 
                        className="flex-1 bg-white text-red-600 hover:bg-gray-100 px-2"
                        onClick={() => { setIsAddingPayment(true); setPaymentType('RECEIPT'); }}
                      >
                        Receive Cash
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="flex-1 bg-white text-blue-600 hover:bg-gray-100 px-2"
                        onClick={() => { setIsAddingPayment(true); setPaymentType('RETURN'); }}
                      >
                        Cash Return
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lifetime Cases Summary */}
              {Object.keys(lifetimeCases).length > 0 && (
                <Card className="bg-white border-gray-100">
                  <CardHeader className="pb-2 pt-4 px-4 border-b border-gray-100">
                    <CardTitle className="text-sm font-semibold text-gray-700">All-Time Items Purchased</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(lifetimeCases).map(([productName, quantity]) => (
                        <div key={productName} className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 flex flex-col min-w-[100px]">
                          <span className="text-xs text-gray-500 truncate" title={productName}>{productName}</span>
                          <span className="text-sm font-bold text-gray-900">{quantity} Cases</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Add Payment Form */}
              {isAddingPayment && (
                <Card className="border-red-200 shadow-sm">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-md flex items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <DollarSign className={`h-4 w-4 ${paymentType === 'RETURN' ? 'text-blue-600' : 'text-red-600'}`} /> 
                        {paymentType === 'RETURN' ? 'Cash Return to' : 'New Payment from'} {selectedOutlet.Name}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setIsAddingPayment(false)}>Cancel</Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase">Amount (Rs)</label>
                        <Input 
                          type="number" 
                          placeholder="e.g. 5000" 
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase">Notes / Ref</label>
                        <Input 
                          placeholder="e.g. Cash handed over" 
                          value={paymentNotes}
                          onChange={(e) => setPaymentNotes(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button onClick={handleAddPayment} className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                        Save Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transaction Table */}
              <Card className="flex-1 overflow-hidden flex flex-col">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <CardTitle className="text-md">Transaction History</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto print:overflow-visible flex-1">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Description</th>
                        <th className="px-4 py-3 font-medium text-right text-red-600">Credit (Sales)</th>
                        <th className="px-4 py-3 font-medium text-right text-green-600">Debit (Receipt)</th>
                        <th className="px-4 py-3 font-medium text-right bg-gray-50">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ledgerEntries.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            No transactions found for this customer.
                          </td>
                        </tr>
                      ) : (
                        ledgerEntries.map((entry) => (
                          <tr 
                            key={entry.id} 
                            onClick={() => {
                              if (entry.type === 'SALE') {
                                setSelectedInvoiceId(entry.id);
                              } else if (entry.type === 'PAYMENT') {
                                setSelectedPaymentId(entry.id);
                              }
                            }}
                            className={`hover:bg-gray-50/50 transition-colors cursor-pointer`}
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                              {format(new Date(entry.date), 'dd MMM yyyy, HH:mm')}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`font-medium ${entry.type === 'SALE' ? 'text-blue-600 hover:underline' : 'text-green-700 hover:underline'}`}>
                                {entry.description}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {entry.credit > 0 ? entry.credit.toLocaleString() : '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-green-600">
                              {entry.debit > 0 ? entry.debit.toLocaleString() : '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-bold bg-gray-50/30">
                              {entry.balance.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Invoice Detail Modal */}
              {selectedInvoice && (
                <InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoiceId(null)} />
              )}
            </>
          )}
        </div>
        
        {selectedPayment && (
          <PaymentDetailModal payment={selectedPayment} onClose={() => setSelectedPaymentId(null)} />
        )}
      </div>
    </div>
  );
}
