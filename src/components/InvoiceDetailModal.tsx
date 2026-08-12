import React, { useEffect, useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { SaleRecord, Outlet, PaymentRecord } from '@/src/types';
import { fetchOutlets, fetchSales, fetchPayments } from '@/src/api';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { PrintOrderView } from '@/src/components/PrintOrderView';

interface InvoiceDetailModalProps {
  invoice: SaleRecord;
  onClose: () => void;
}

export function InvoiceDetailModal({ invoice, onClose }: InvoiceDetailModalProps) {
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [outletsList, setOutletsList] = useState<Outlet[]>([]);

  useEffect(() => {
    const loadLedgerData = async () => {
      try {
        const [outlets, sales, payments] = await Promise.all([
          fetchOutlets(),
          fetchSales(),
          fetchPayments()
        ]);
        setOutletsList(outlets);

        const outlet = outlets.find(o => o.Name === invoice.OutletName);
        if (outlet) {
          let balance = outlet.OpeningBalance || 0;
          
          const outletSales = sales.filter(s => s.OutletName === outlet.Name);
          const outletPayments = payments.filter(p => p.OutletID === outlet.ID);
          
          outletSales.forEach(s => {
            balance += s.GrandTotal;
          });
          
          outletPayments.forEach(p => {
            if (p.Type === 'RETURN') { balance += p.Amount; } else { balance -= p.Amount; }
          });
          
          setCurrentBalance(balance);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadLedgerData();
  }, [invoice]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 print:bg-transparent print:p-0">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden print:shadow-none print:max-h-none print:overflow-visible">
        <PrintOrderView sale={invoice} outlets={outletsList} />
        
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 print:hidden">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Invoice #{invoice.ID}</h2>
            <p className="text-xs text-gray-500">{format(new Date(invoice.Date), 'dd MMM yyyy, hh:mm a')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="print:hidden">
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
            <Button variant="outline" size="sm" onClick={onClose} className="print:hidden">Close</Button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6 print:hidden">
          <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 bg-red-50 rounded-lg border border-red-100">
            <div>
              <p className="text-xs font-semibold text-red-800 uppercase">Remaining to Receive (Total)</p>
              {loading ? (
                <div className="h-7 w-24 bg-red-200/50 animate-pulse rounded mt-1" />
              ) : (
                <p className="text-xl font-bold text-red-600">Rs {currentBalance.toLocaleString()}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Total Invoice Value</p>
              <p className="text-xl font-bold text-gray-900">Rs {invoice.GrandTotal.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">Items Purchased ({invoice.TotalCases} Cases Total)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-right">Qty (Cases)</th>
                    <th className="px-4 py-2 text-right">Price</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoice.Items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 font-medium text-gray-900">{item.ProductName}</td>
                      <td className="px-4 py-3 text-right">{item.Quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{item.Price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-medium">{item.Amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {invoice.Discount > 0 && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded text-sm">
              <span className="font-medium text-gray-600">Discount Applied</span>
              <span className="font-bold text-red-600">- Rs {invoice.Discount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
