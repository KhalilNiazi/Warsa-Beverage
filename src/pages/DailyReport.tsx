import React, { useState, useEffect } from 'react';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { fetchSales, fetchInventory, fetchOutlets } from '@/src/api';
import { SaleRecord, InventoryItem, Outlet } from '@/src/types';
import { Printer, MessageCircle } from 'lucide-react';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { format, isSameDay, parseISO } from 'date-fns';

export function DailyReport() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showIframeWarning, setShowIframeWarning] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleWhatsAppShare = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `Daily_Report_${selectedDate}.pdf`, { type: 'application/pdf' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Daily Report ${selectedDate}`,
          text: `Here is the daily report for ${selectedDate}.`
        });
      } else {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        window.open(`https://wa.me/?text=Please%20find%20the%20downloaded%20Daily%20Report%20for%20${selectedDate}%20attached.`, '_blank');
      }
    } catch (error) {
      console.error('Error sharing report:', error);
      alert('Failed to generate or share PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (window.self !== window.top) {
      setShowIframeWarning(true);
    }
    setTimeout(() => {
      try { window.print(); } catch(e) {}
    }, 100);
  };
  
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const loadData = async () => {
    setLoading(true);
    try {
      const [salesData, invData, outletsData] = await Promise.all([
        fetchSales(),
        fetchInventory(),
        fetchOutlets()
      ]);
      setSales(salesData);
      setInventory(invData);
      setOutlets(outletsData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const dailySales = sales.filter(s => isSameDay(parseISO(s.Date), parseISO(selectedDate)));

  const soldProductIds = new Set<string>();
  dailySales.forEach(s => {
    s.Items.forEach(i => soldProductIds.add(i.ProductID));
  });

  const columns = inventory.filter(inv => soldProductIds.has(inv.ID));

  let overallTotalCases = 0;
  let overallAmount = 0;
  const colTotals: Record<string, number> = {};

  const reportRows = dailySales.map(sale => {
    const outlet = outlets.find(o => o.Name === sale.OutletName || o.Address === sale.Address);
    
    let saleCases = 0;
    const prodCounts: Record<string, number> = {};
    sale.Items.forEach(item => {
      prodCounts[item.ProductID] = (prodCounts[item.ProductID] || 0) + item.Quantity;
      colTotals[item.ProductID] = (colTotals[item.ProductID] || 0) + item.Quantity;
      saleCases += item.Quantity;
    });

    overallTotalCases += saleCases;
    overallAmount += sale.GrandTotal;

    return {
      Code: outlet?.Code || '-',
      CustomerName: sale.OutletName,
      Route: sale.Route || outlet?.Route || '-',
      OB: outlet?.OB || sale.OwnerName || '-',
      ProductCounts: prodCounts,
      TotalCases: saleCases,
      Amount: sale.GrandTotal,
      Average: saleCases > 0 ? (sale.GrandTotal / saleCases) : 0
    };
  });

  return (
    <>
      <style type="text/css" media="print">
        {`
          @page { size: landscape; margin: 0.5cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          .print\\:hidden { display: none !important; }
        `}
      </style>
      {showIframeWarning && (
        <div className="bg-amber-100 text-amber-800 p-4 mb-4 max-w-7xl mx-auto flex justify-between items-center print:hidden text-sm rounded-md shadow-sm mt-4">
          <p><strong>Note:</strong> If the print dialog didn't open, it's because the preview window blocks popups. Please click the <strong>"Open in New Tab"</strong> icon at the top right of the screen to print.</p>
          <Button variant="ghost" size="sm" onClick={() => setShowIframeWarning(false)}>Dismiss</Button>
        </div>
      )}
      
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-6 print:p-0 print:m-0 print:w-full print:max-w-none print:space-y-4">
        
        {/* Header - Hidden on print */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Daily Order Report</h1>
            <p className="text-sm md:text-base text-[#6b7280] mt-1">Printable format matching daily excel sheet.</p>
          </div>
          <div className="flex items-center gap-2">
            <Input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
            <Button onClick={handleWhatsAppShare} className="bg-green-600 hover:bg-green-700 text-[#fff]" disabled={isGenerating}>
              <MessageCircle className="w-4 h-4 mr-2" />
              {isGenerating ? 'Preparing...' : 'Share WA'}
            </Button>
            <Button onClick={handlePrint} className="bg-red-600 hover:bg-red-700">
              <Printer className="w-4 h-4 mr-2" />
              Print Report
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#6b7280] print:hidden">Loading report...</div>
        ) : (
          <div ref={reportRef} className="w-full bg-[#fff] print:bg-[#fff] text-[#000] font-sans text-xs p-4">
            <div className="text-center mb-4 font-bold text-lg uppercase tracking-widest border-b-2 border-[#000] pb-2">
              WARSA PURE WATER - DAILY SALES REPORT ({format(parseISO(selectedDate), 'dd MMM yyyy')})
            </div>
            {/* Main Table */}
            <table className="w-full border-collapse border border-[#000] mb-4 print:mb-2">
              <thead>
                <tr>
                  <th className="border border-[#000] bg-[#e2aa1e] text-[#000] font-bold italic py-1 px-2 text-center w-12">CODE</th>
                  <th className="border border-[#000] bg-[#e2aa1e] text-[#000] font-bold italic py-1 px-2 text-left">CUSTOMER NAME</th>
                  <th className="border border-[#000] bg-[#e2aa1e] text-[#000] font-bold italic py-1 px-2 text-left">ROUTE</th>
                  <th className="border border-[#000] bg-[#e2aa1e] text-[#000] font-bold italic py-1 px-2 text-left">OB</th>
                  {columns.map(col => (
                    <th key={col.ID} className="border border-[#000] bg-[#e2aa1e] text-[#000] font-bold italic py-1 px-2 text-center w-16">{col.Name}</th>
                  ))}
                  <th className="border border-[#000] bg-[#e2aa1e] text-[#000] font-bold italic py-1 px-2 text-center w-16">PROMO</th>
                  <th className="border border-[#000] bg-[#e2aa1e] text-[#000] font-bold italic py-1 px-2 text-center w-20">TOTAL<br/>CASES</th>
                  <th className="border border-[#000] bg-[#e2aa1e] text-[#000] font-bold italic py-1 px-2 text-center w-24">AMOUNT</th>
                  <th className="border border-[#000] bg-[#e2aa1e] text-[#000] font-bold italic py-1 px-2 text-center w-16">AVRG</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.length === 0 ? (
                  <tr>
                    <td colSpan={9 + columns.length} className="border border-[#000] p-4 text-center text-[#6b7280] font-bold text-base">
                      No orders found for this date.
                    </td>
                  </tr>
                ) : (
                  reportRows.map((row, idx) => (
                    <tr key={idx} className="bg-[#f2f2f2]">
                      <td className="border border-[#000] px-2 py-1 text-center">{row.Code}</td>
                      <td className="border border-[#000] px-2 py-1 text-left">{row.CustomerName}</td>
                      <td className="border border-[#000] px-2 py-1 text-left">{row.Route}</td>
                      <td className="border border-[#000] px-2 py-1 text-left">{row.OB}</td>
                      {columns.map(col => (
                        <td key={col.ID} className="border border-[#000] px-2 py-1 text-center">
                          {row.ProductCounts[col.ID] || ''}
                        </td>
                      ))}
                      <td className="border border-[#000] px-2 py-1 text-center"></td>
                      <td className="border border-[#000] px-2 py-1 text-center">{row.TotalCases}</td>
                      <td className="border border-[#000] px-2 py-1 text-center">{row.Amount.toFixed(0)}</td>
                      <td className="border border-[#000] px-2 py-1 text-center">{row.Average.toFixed(0)}</td>
                    </tr>
                  ))
                )}
               
                {reportRows.length > 0 && (
                  <tr className="bg-[#c8c800] font-bold text-[#000] text-sm">
                    <td colSpan={4} className="border border-[#000] px-2 py-2 text-center uppercase tracking-widest text-sm">TOTAL</td>
                    {columns.map(col => (
                      <td key={col.ID} className="border border-[#000] px-2 py-2 text-center">
                        {colTotals[col.ID] || 0}
                      </td>
                    ))}
                    <td className="border border-[#000] px-2 py-2 text-center">0</td>
                    <td className="border border-[#000] px-2 py-2 text-center">{overallTotalCases}</td>
                    <td className="border border-[#000] px-2 py-2 text-center">{overallAmount.toFixed(0)}</td>
                    <td className="border border-[#000] px-2 py-2 text-center">
                      {overallTotalCases > 0 ? (overallAmount / overallTotalCases).toFixed(2) : 0}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Bottom Section Layout */}
            {reportRows.length > 0 && (
              <div className="flex flex-col md:flex-row gap-4 print:flex-row print:gap-1 items-start mt-8 print:mt-4">
                
                {/* Sale and Load Summaries (Left + Middle Block) */}
                <div className="flex w-full md:w-[65%] print:w-[65%]">
                   {/* SALE large box */}
                   <div className="border border-[#000] w-24 md:w-32 flex items-center justify-center font-bold italic text-lg bg-[#e2e2e2]">
                     SALE
                   </div>
                   
                   {/* Main Load Box */}
                   <div className="flex-1 border border-[#000] border-l-0">
                     <table className="w-full text-center border-collapse">
                       <thead>
                         <tr>
                           <th className="border border-[#000] border-t-0 py-1 bg-[#d9d9d9] font-bold"></th>
                           {columns.map(col => <th key={col.ID} className="border border-[#000] border-t-0 py-1 bg-[#c5c5c5] italic text-xs font-bold text-[#7f1d1d]">{col.Name}</th>)}
                           <th className="border border-[#000] border-t-0 border-r-0 py-1 bg-[#c5c5c5] italic text-xs font-bold text-[#7f1d1d]">TOTAL</th>
                         </tr>
                       </thead>
                       <tbody>
                         <tr>
                           <td className="border border-[#000] py-1 px-2 font-bold italic bg-[#4bacc6] text-[#000]">PENDING LOAD</td>
                           {columns.map(col => <td key={col.ID} className="border border-[#000] bg-[#e2aa1e]"></td>)}
                           <td className="border border-[#000] border-r-0 bg-[#9bbb59] font-bold">0</td>
                         </tr>
                         <tr>
                           <td className="border border-[#000] py-1 px-2 font-bold italic bg-[#9bbb59] text-[#000]">LOAD OUT</td>
                           {columns.map(col => <td key={col.ID} className="border border-[#000] bg-[#c00000]"></td>)}
                           <td className="border border-[#000] border-r-0 bg-[#4bacc6] font-bold">0</td>
                         </tr>
                         <tr>
                           <td className="border border-[#000] py-1 px-2 font-bold italic bg-[#8064a2] text-[#000]">TOTAL LOAD</td>
                           {columns.map(col => <td key={col.ID} className="border border-[#000] bg-[#fcd5b4] text-[#000] font-bold">{colTotals[col.ID] || 0}</td>)}
                           <td className="border border-[#000] border-r-0 bg-[#fff] font-bold"></td>
                         </tr>
                         <tr>
                           <td className="border-t border-[#000] bg-[#fff]"></td>
                           <td colSpan={columns.length} className="border border-[#000] border-b-0 py-1 font-bold bg-[#4f81bd] text-[#fff]">
                             {overallTotalCases}
                           </td>
                           <td className="border-t border-[#000]"></td>
                         </tr>
                       </tbody>
                     </table>
                   </div>
                </div>

                {/* FULIN box (Right Block) */}
                <div className="w-full md:w-[35%] print:w-[35%] flex">
                  <div className="w-4 border-b border-[#000]"></div> {/* Spacer line */}
                  <table className="flex-1 border-collapse border border-[#000] bg-[#e2e2e2]">
                    <tbody>
                      <tr>
                        <td colSpan={2} className="border border-[#000] italic font-bold text-center py-1 bg-[#e2e2e2]">FULIN</td>
                      </tr>
                      {columns.map(col => (
                        <tr key={col.ID}>
                          <td className="border border-[#000] font-bold italic text-center py-1 bg-[#e2e2e2] px-4 w-1/2">{col.Name}</td>
                          <td className="border border-[#000] bg-[#fff] w-1/2"></td>
                        </tr>
                      ))}
                      <tr>
                        <td className="border border-[#000] font-bold italic text-center py-1 bg-[#e2e2e2]">TOTAL</td>
                        <td className="border border-[#000] font-bold text-center py-1 bg-[#fff]">0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STORE MAN section */}
            {reportRows.length > 0 && (
              <div className="mt-6 print:mt-4 flex w-full md:w-[40%] print:w-[40%]">
                <div className="border border-[#000] w-32 md:w-40 flex items-center justify-center font-bold italic text-lg py-6 bg-[#e2e2e2]">
                  STORE MAN
                </div>
                <div className="flex-1 border border-[#000] border-l-0 bg-[#fff]"></div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </>
  );
}
