import React, { useEffect, useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { PaymentRecord, Outlet } from '@/src/types';
import { fetchOutlets, fetchSales, fetchPayments } from '@/src/api';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';

interface PaymentDetailModalProps {
  payment: PaymentRecord;
  onClose: () => void;
}

export function PaymentDetailModal({ payment, onClose }: PaymentDetailModalProps) {
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [outlet, setOutlet] = useState<Outlet | null>(null);

  useEffect(() => {
    const loadLedgerData = async () => {
      try {
        const [outlets, sales, payments] = await Promise.all([
          fetchOutlets(),
          fetchSales(),
          fetchPayments()
        ]);
        const foundOutlet = outlets.find(o => o.ID === payment.OutletID);
        setOutlet(foundOutlet || null);

        if (foundOutlet) {
          let balance = foundOutlet.OpeningBalance || 0;
          
          const outletSales = sales.filter(s => s.OutletName === foundOutlet.Name);
          const outletPayments = payments.filter(p => p.OutletID === foundOutlet.ID);
          
          outletSales.forEach(s => {
            balance += s.GrandTotal;
          });
          
          outletPayments.forEach(p => {
            if (p.Type === 'RETURN') {
              balance += p.Amount;
            } else {
              balance -= p.Amount;
            }
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
  }, [payment]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4 bg-black/60">
      <div className="bg-white rounded-t-2xl md:rounded-xl shadow-xl w-full md:w-auto md:min-w-[400px] max-w-md max-h-[90dvh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 md:zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{payment.Type === 'RETURN' ? 'Cash Return' : 'Cash Receipt'}</h2>
            <p className="text-xs text-gray-500">{format(new Date(payment.Date), 'dd MMM yyyy, hh:mm a')}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">
              {payment.Type === 'RETURN' ? 'Amount Returned to Customer' : 'Amount Received'}
            </p>
            <p className={`text-4xl font-bold ${payment.Type === 'RETURN' ? 'text-blue-600' : 'text-green-600'}`}>
              Rs {payment.Amount.toLocaleString()}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 text-sm">Customer</span>
              <span className="font-semibold text-gray-900">{outlet?.Name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 text-sm">Receipt ID</span>
              <span className="font-medium text-gray-900">{payment.ID}</span>
            </div>
            <div className="flex flex-col border-b pb-2">
              <span className="text-gray-500 text-sm mb-1">Notes / Description</span>
              <span className="font-medium text-gray-900">{payment.Notes || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Current Balance</span>
              <span className="font-bold text-red-600">
                {loading ? '...' : `Rs ${currentBalance.toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
