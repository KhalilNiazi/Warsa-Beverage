import os

content = """import React from 'react';
import { SaleRecord, Outlet } from '@/src/types';
import { format } from 'date-fns';
import { cn } from '@/src/lib/utils';
import { Store, Route, MapPin, PhoneCall, Phone, MessageCircle, QrCode } from 'lucide-react';

export const PrintOrderView = ({ sale, outlets }: { sale: SaleRecord | null, outlets: Outlet[] }) => {
  if (!sale) return null;
  const outlet = outlets.find(o => o.Name === sale.OutletName || o.Address === sale.Address);
  
  const WaveLogo = () => (
    <svg viewBox="0 0 100 50" className="w-32 h-16 fill-white">
      <path d="M10,35 Q25,15 45,25 T90,15 Q75,35 55,25 T15,35" />
      <path d="M5,45 Q20,25 40,35 T85,25 Q70,45 50,35 T10,45" opacity="0.8" />
      <circle cx="20" cy="12" r="3" />
      <circle cx="28" cy="18" r="2" />
      <circle cx="12" cy="20" r="1.5" />
    </svg>
  );

  const WatermarkSVG = () => (
    <svg viewBox="0 0 100 50" className="w-64 h-32 fill-[#e61c24] opacity-20 transform -rotate-12">
      <path d="M10,35 Q25,15 45,25 T90,15 Q75,35 55,25 T15,35" />
      <path d="M5,45 Q20,25 40,35 T85,25 Q70,45 50,35 T10,45" opacity="0.8" />
      <circle cx="20" cy="12" r="3" />
      <circle cx="28" cy="18" r="2" />
      <circle cx="12" cy="20" r="1.5" />
    </svg>
  );

  return (
    <div className="hidden print:block w-full max-w-[800px] mx-auto bg-white text-black font-sans p-0 m-0">
      <style type="text/css" media="print">
        {`
          @page { size: A4 portrait; margin: 0.5cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          .print\\\\:hidden { display: none !important; }
        `}
      </style>
      
      {/* HEADER */}
      <div className="relative h-32 bg-[#1a1a1a] overflow-hidden flex text-white">
        {/* Red shape */}
        <div 
          className="absolute inset-y-0 left-0 w-[78%] bg-[#e61c24] z-0" 
          style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)' }} 
        />
        
        <div className="relative z-10 flex w-full">
          <div className="flex-1 flex items-center p-6 gap-4">
            <WaveLogo />
            <div className="flex flex-col">
              <div className="text-sm font-semibold tracking-[0.2em]">PURE WATER</div>
              <div className="text-5xl font-black tracking-tight leading-none uppercase">WARSA</div>
              <div className="text-[10px] font-bold tracking-[0.3em] mt-1">BOTTLED DRINKING WATER</div>
            </div>
          </div>
          <div className="w-40 flex flex-col items-center justify-center border-l-2 border-dashed border-gray-600/50 my-4">
            <div className="text-white text-lg font-bold tracking-widest">CODE</div>
            <div className="text-[#e61c24] text-5xl font-black">{outlet?.Code || sale.OutletID || '79'}</div>
          </div>
        </div>
      </div>

      {/* ADDRESS / CONTACT STRIP */}
      <div className="flex items-center justify-center py-4 text-sm font-bold gap-12">
        <div className="flex items-center gap-3">
          <div className="text-[#e61c24]"><MapPin className="w-6 h-6 fill-[#e61c24] text-white"/></div>
          <span className="leading-tight">40-1 Saddar Bazar<br/>Dhaka Road Lahore Cantt</span>
        </div>
        <div className="w-px h-8 bg-gray-300"></div>
        <div className="flex items-center gap-3">
          <div className="bg-[#e61c24] text-white p-1.5 rounded-full"><Phone className="w-4 h-4 fill-[#e61c24] text-white"/></div>
          <span className="text-lg">[0314-1421965]</span>
        </div>
      </div>

      {/* OUTLET INFO GRID */}
      <table className="w-full border-collapse border border-[#e61c24] text-[11px] font-bold text-center mt-2">
        <colgroup>
          <col style={{ width: '40px' }} />
          <col style={{ width: '130px' }} />
          <col style={{ width: 'auto' }} />
          <col style={{ width: '100px' }} />
          <col style={{ width: '130px' }} />
          <col style={{ width: '100px' }} />
        </colgroup>
        <tbody>
          {/* Row 1 */}
          <tr>
            <td className="bg-[#e61c24] text-white p-1.5 border border-[#e61c24]">
              <Store className="w-5 h-5 mx-auto"/>
            </td>
            <td className="text-[#e61c24] text-left px-3 border border-[#e61c24] uppercase text-[12px]">Outlet Name</td>
            <td className="text-left px-3 border border-[#e61c24] uppercase text-[12px]">{sale.OutletName}</td>
            <td className="text-[#e61c24] text-left px-3 border border-[#e61c24] uppercase text-[12px]">Invoice #</td>
            <td className="bg-[#e61c24] text-white border border-[#e61c24] uppercase text-[12px]">Original</td>
            <td className="border border-[#e61c24] uppercase text-sm">Credit</td>
          </tr>
          {/* Row 2 */}
          <tr>
            <td className="bg-[#e61c24] text-white p-1.5 border border-[#e61c24]">
              <Route className="w-5 h-5 mx-auto"/>
            </td>
            <td className="text-[#e61c24] text-left px-3 border border-[#e61c24] uppercase text-[12px]">Rout</td>
            <td className="text-left px-3 border border-[#e61c24] uppercase text-[12px]">{sale.Route}</td>
            <td className="text-[#e61c24] text-left px-3 border border-[#e61c24] uppercase text-[12px]">Date#</td>
            <td className="border border-[#e61c24] text-[12px]">{format(new Date(sale.Date), 'M/d/yyyy HH:mm')}</td>
            <td className="border border-[#e61c24] text-xl" rowSpan={2}>{outlet?.OpeningBalance || 0}</td>
          </tr>
          {/* Row 3 */}
          <tr>
            <td className="bg-[#e61c24] text-white p-1.5 border border-[#e61c24]">
              <MapPin className="w-5 h-5 mx-auto"/>
            </td>
            <td className="text-[#e61c24] text-left px-3 border border-[#e61c24] uppercase text-[12px]">Address</td>
            <td className="text-left px-3 border border-[#e61c24] uppercase text-[12px]">{sale.Address}</td>
            <td className="text-[#e61c24] text-left px-3 border border-[#e61c24] uppercase text-[12px]">Status</td>
            <td className="border border-[#e61c24] uppercase text-[12px]">{sale.Status}</td>
          </tr>
          {/* Row 4 */}
          <tr>
            <td className="bg-[#e61c24] text-white p-1.5 border border-[#e61c24]">
              <PhoneCall className="w-5 h-5 mx-auto"/>
            </td>
            <td className="text-[#e61c24] text-left px-3 border border-[#e61c24] uppercase text-[12px]">Contact Number</td>
            <td className="text-left px-3 border border-[#e61c24] uppercase text-[12px]">{sale.ContactNumber}</td>
            <td className="text-[#e61c24] text-left px-3 border border-[#e61c24] uppercase text-[12px]">Owner</td>
            <td className="border border-[#e61c24] uppercase text-[12px]">{sale.OwnerName}</td>
            <td className="border border-[#e61c24] uppercase text-[12px]">{outlet?.OB}</td>
          </tr>
        </tbody>
      </table>

      {/* MAIN CONTENT AREA */}
      <div className="flex mt-2 items-stretch border border-t-0 border-[#e61c24]">
        <div className="flex-1 flex flex-col">
          {/* Items Table */}
          <table className="w-full border-collapse text-xs font-bold text-center">
            <colgroup>
              <col style={{ width: '60px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '100px' }} />
            </colgroup>
            <thead>
              <tr className="bg-[#e61c24] text-white text-[11px]">
                <th className="py-2.5 px-2 border-r border-[#e61c24] uppercase">Items</th>
                <th className="py-2.5 px-2 border-r border-[#e61c24] uppercase">Description</th>
                <th className="py-2.5 px-2 border-r border-[#e61c24] uppercase">Quantity</th>
                <th className="py-2.5 px-2 border-r border-[#e61c24] uppercase">Full Price</th>
                <th className="py-2.5 px-2 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              {sale.Items.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? "bg-[#fceeed]" : "bg-white"}>
                  <td className="py-2.5 px-2 border-r border-t border-[#e61c24]">{idx + 1}</td>
                  <td className="py-2.5 px-2 border-r border-t border-[#e61c24] uppercase">{item.ProductName}</td>
                  <td className="py-2.5 px-2 border-r border-t border-[#e61c24]">{item.Quantity}</td>
                  <td className="py-2.5 px-2 border-r border-t border-[#e61c24]">{item.Price}</td>
                  <td className="py-2.5 px-2 border-t border-[#e61c24]">{item.Amount}</td>
                </tr>
              ))}
              
              {/* Ensure a minimum number of rows (e.g. 4 rows) to match the layout proportions */}
              {Array.from({ length: Math.max(0, 4 - sale.Items.length) }).map((_, idx) => (
                <tr key={`empty-${idx}`} className={(sale.Items.length + idx) % 2 === 1 ? "bg-[#fceeed]" : "bg-white"}>
                  <td className="py-2.5 px-2 border-r border-t border-[#e61c24] text-transparent">.</td>
                  <td className="py-2.5 px-2 border-r border-t border-[#e61c24]"></td>
                  <td className="py-2.5 px-2 border-r border-t border-[#e61c24]"></td>
                  <td className="py-2.5 px-2 border-r border-t border-[#e61c24]"></td>
                  <td className="py-2.5 px-2 border-t border-[#e61c24]"></td>
                </tr>
              ))}

              {/* TOTAL CASES row */}
              <tr className="bg-white">
                <td colSpan={2} className="py-2.5 px-6 border-r border-t border-[#e61c24] text-[#e61c24] uppercase text-left text-sm tracking-wide">Total Cases</td>
                <td className="py-2.5 px-2 border-r border-t border-[#e61c24] text-sm">{sale.TotalCases}</td>
                <td colSpan={2} className="py-2.5 px-2 border-t border-[#e61c24] bg-white"></td>
              </tr>
            </tbody>
          </table>
          
          {/* Totals & Signature Block */}
          <div className="flex border-t border-[#e61c24] flex-1">
            {/* Signature */}
            <div className="flex-1 relative flex items-end p-6">
              {/* Faint watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pr-8">
                <WatermarkSVG />
              </div>
              <div className="relative z-10 w-full flex items-end gap-4">
                <div className="text-xs font-bold whitespace-nowrap">Customer Signature</div>
                <div className="border-b border-dashed border-black flex-1 mb-1"></div>
              </div>
            </div>
            
            {/* Totals */}
            <div className="w-[200px] border-l border-[#e61c24]">
              <table className="w-full text-sm font-bold text-center border-collapse h-full">
                <tbody>
                  <tr>
                    <td className="py-3 px-2 text-[#e61c24] border-b border-[#e61c24] border-r uppercase text-[11px] w-1/2">Total Amount</td>
                    <td className="py-3 px-2 border-b border-[#e61c24] w-1/2">{sale.TotalAmount}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 text-[#e61c24] border-b border-[#e61c24] border-r uppercase text-[11px]">Discount</td>
                    <td className="py-3 px-2 border-b border-[#e61c24]">{sale.Discount || 0}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 bg-[#e61c24] text-white uppercase border-r border-[#e61c24] text-[11px]">Grand Total</td>
                    <td className="py-3 px-2 bg-black text-white text-xl">{sale.GrandTotal}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar for Phone Numbers */}
        <div className="w-14 border-l border-[#e61c24] flex flex-col justify-center items-center py-6 bg-white gap-8 shrink-0">
           <div className="flex items-center space-x-2 text-black font-bold tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
             <span className="text-sm">03413475816</span>
             <Phone className="w-4 h-4 text-[#e61c24] rotate-90" />
           </div>
           <div className="w-px h-12 bg-gray-300"></div>
           <div className="flex items-center space-x-2 text-black font-bold tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
             <span className="text-sm">03415956432 (WhatsApp)</span>
             <MessageCircle className="w-4 h-4 text-[#e61c24] rotate-90" />
           </div>
        </div>
      </div>

      {/* FOOTER MESSAGE */}
      <div className="flex items-center justify-center my-6 gap-3">
        <div className="w-2 h-2 rounded-full bg-[#e61c24]"></div>
        <div className="w-16 h-px bg-[#e61c24]"></div>
        <span className="text-[#e61c24] font-serif italic text-2xl font-semibold">Thank you for your business!</span>
        <div className="w-16 h-px bg-[#e61c24]"></div>
        <div className="w-2 h-2 rounded-full bg-[#e61c24]"></div>
      </div>

      {/* BOTTOM STRIP */}
      <div className="relative h-20 bg-[#1a1a1a] overflow-hidden flex items-center justify-between px-6">
        {/* Right Red area */}
        <div 
          className="absolute inset-y-0 right-0 w-[85%] bg-[#e61c24] z-0" 
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)' }} 
        />
        
        <div className="relative z-10 flex items-center gap-4 text-white">
          <div className="bg-white p-1 rounded-sm"><QrCode className="w-12 h-12 text-black" /></div>
          <div className="flex items-center gap-8 text-xs font-bold ml-6">
            <div className="flex items-center gap-3">
              <div className="text-white"><MapPin className="w-6 h-6 fill-white text-[#e61c24]"/></div>
              <span className="leading-tight">40-1 Saddar Bazar<br/>Dhaka Road Lahore Cantt</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-white"><Phone className="w-6 h-6 fill-white text-[#e61c24]"/></div>
              <span className="text-base">[0314-1421965]</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center mr-2">
          <div className="text-white text-sm font-bold tracking-widest leading-none">CODE</div>
          <div className="text-white text-4xl font-black leading-none mt-1">{outlet?.Code || sale?.OutletID || '79'}</div>
        </div>
      </div>

    </div>
  );
};
"""

with open('src/components/PrintOrderView.tsx', 'w') as f:
    f.write(content)
