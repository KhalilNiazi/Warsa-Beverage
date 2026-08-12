import React from 'react';
import { SaleRecord, Outlet } from '@/src/types';
import { format } from 'date-fns';
import { cn } from '@/src/lib/utils';

export const PrintOrderView = ({ sale, outlets }: { sale: SaleRecord | null, outlets: Outlet[] }) => {
  if (!sale) return null;
  const outlet = outlets.find(o => o.Name === sale.OutletName || o.Address === sale.Address);
  
  return (
    <div className="hidden print:block w-full bg-white text-black font-sans p-0 m-0">
      <style type="text/css" media="print">
        {`
          @page { size: portrait; margin: 0.5cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          .print\\:hidden { display: none !important; }
        `}
      </style>
      
      <table className="w-full border-collapse border-2 border-black text-xs font-bold text-center">
        <colgroup>
          <col width="16%" />
          <col width="28%" />
          <col width="16%" />
          <col width="14%" />
          <col width="14%" />
          <col width="12%" />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={5} className="bg-black text-white py-2 text-lg uppercase tracking-widest border border-black">WARSA PURE WATER</td>
            <td className="bg-[#ffff00] text-black border border-black text-base">CODE</td>
          </tr>
          <tr>
            <td colSpan={5} className="border border-black py-2 text-sm">2 Abbot Road Chowk Lakshmi Lahore(0311-1199778)</td>
            <td className="bg-[#ffff00] text-black border border-black text-base">{outlet?.Code || '-'}</td>
          </tr>
          
          <tr className="bg-white">
            <td className="border border-black py-1.5 uppercase">OUTLET NAME</td>
            <td className="border border-black py-1.5 uppercase text-sm">{sale.OutletName}</td>
            <td className="border border-black py-1.5 uppercase">INVOICE #</td>
            <td colSpan={2} className="bg-[#f0d060] border border-black py-1.5 uppercase italic">ORIGINAL</td>
            <td className="border border-black py-1.5 uppercase underline">CREDIT</td>
          </tr>
          <tr className="bg-white">
            <td className="border border-black py-1.5 uppercase">ROUT</td>
            <td className="border border-black py-1.5 uppercase">{sale.Route}</td>
            <td className="border border-black py-1.5 uppercase">DATE#</td>
            <td colSpan={2} className="border border-black py-1.5 uppercase">{format(new Date(sale.Date), 'M/d/yyyy HH:mm')}</td>
            <td className="border border-black py-1.5 underline">0</td>
          </tr>
          <tr className="bg-white">
            <td className="border border-black py-1.5 uppercase">ADDRESS</td>
            <td className="border border-black py-1.5 uppercase">{sale.Address}</td>
            <td className="border border-black py-1.5 uppercase">STATUS</td>
            <td colSpan={2} className="border border-black py-1.5 uppercase">{sale.Status || 'General trader'}</td>
            <td className="border-l border-r border-black border-b-0 py-1.5"></td>
          </tr>
          <tr className="bg-white">
            <td className="border border-black py-1.5 uppercase">Contact Number</td>
            <td className="border border-black py-1.5 uppercase">{sale.ContactNumber || '0'}</td>
            <td className="border border-black py-1.5 uppercase">OWNER NAME</td>
            <td className="border border-black py-1.5 uppercase">{sale.OwnerName}</td>
            <td className="bg-[#f0d060] border border-black py-1.5 uppercase">{outlet?.OB || '-'}</td>
            <td className="border-l border-r border-black border-t-0 border-b-0 py-1.5">0</td>
          </tr>
          
          <tr className="bg-white">
            <td className="border border-black py-2 uppercase">ITEMS</td>
            <td className="border border-black py-2 uppercase">DESCREPTION</td>
            <td className="border border-black py-2 uppercase">QUANTITY</td>
            <td className="border border-black py-2 uppercase">PRICE</td>
            <td className="border border-black py-2 uppercase">AMOUNT</td>
            <td className="border-l border-r border-black border-t-0 border-b-0 py-2"></td>
          </tr>
          
          {sale.Items.map((item, idx) => (
            <tr key={idx} className="bg-white">
              <td className="border border-black py-2 text-[#c00000]">{idx + 1}</td>
              <td className="border border-black py-2 uppercase">{item.ProductName}</td>
              <td className={cn("border border-black py-2", item.Quantity > 0 ? "bg-[#daeef3]" : "")}>{item.Quantity || ''}</td>
              <td className="border border-black py-2">{item.Price}</td>
              <td className={cn("border border-black py-2", item.Quantity > 0 ? "bg-[#daeef3]" : "")}>{item.Amount}</td>
              <td className="border-l border-r border-black border-t-0 border-b-0 py-2"></td>
            </tr>
          ))}
          
          <tr className="bg-[#ebf1de]">
            <td className="border border-black py-2">{sale.Items.length + 1}</td>
            <td className="border border-black py-2 uppercase italic text-left px-2">PROMO 500 ml</td>
            <td className="border border-black py-2"></td>
            <td className="border border-black py-2"></td>
            <td className="border border-black py-2"></td>
            <td className="border-l border-r border-black border-t-0 border-b-0 py-2"></td>
          </tr>
          
          <tr className="bg-white">
            <td colSpan={2} className="border border-black py-2 text-right px-4 uppercase">TOTAL CASES</td>
            <td className="border border-black py-2">{sale.TotalCases}</td>
            <td className="border border-black py-2 border-b-0"></td>
            <td className="border border-black py-2 border-b-0"></td>
            <td className="border-l border-r border-black border-t-0 border-b-0 py-2"></td>
          </tr>
          
          <tr className="bg-white">
            <td colSpan={3} rowSpan={3} className="border border-black p-4 align-bottom text-left text-sm font-normal">
              Customer Signature
            </td>
            <td className="border border-black py-2 uppercase">TOTAL AMOUNT</td>
            <td colSpan={2} className="border border-black py-2">{sale.TotalAmount}</td>
          </tr>
          <tr className="bg-white">
            <td className="border border-black py-2 uppercase">DISCOUNT</td>
            <td colSpan={2} className="border border-black py-2">{sale.Discount || 0}</td>
          </tr>
          <tr className="bg-white">
            <td className="border border-black py-2 uppercase">GRAND TOTAL</td>
            <td colSpan={2} className="border border-black py-2">{sale.GrandTotal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
