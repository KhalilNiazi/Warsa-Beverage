import re

with open('src/pages/DailyReport.tsx', 'r') as f:
    content = f.read()

# 1. Add imports
content = content.replace("import { Printer } from 'lucide-react';", 
                          "import { Printer, MessageCircle } from 'lucide-react';\nimport { useRef } from 'react';\nimport html2canvas from 'html2canvas';\nimport { jsPDF } from 'jspdf';")

# 2. Add ref to the report container
content = content.replace('<div className="w-full bg-white print:bg-white text-black font-sans text-xs">',
                          '<div ref={reportRef} className="w-full bg-white print:bg-white text-black font-sans text-xs p-4">')

# 3. Add handleWhatsAppShare and reportRef
target_insertion = """  const handlePrint = () => {"""
insertion_code = """  const reportRef = useRef<HTMLDivElement>(null);
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

  const handlePrint = () => {"""

content = content.replace(target_insertion, insertion_code)

# 4. Add the Share Button next to the Print button
button_insertion = """<Button onClick={handlePrint} className="bg-red-600 hover:bg-red-700">
              <Printer className="w-4 h-4 mr-2" />
              Print Report
            </Button>"""
new_button_insertion = """<Button onClick={handleWhatsAppShare} className="bg-green-600 hover:bg-green-700 text-white" disabled={isGenerating}>
              <MessageCircle className="w-4 h-4 mr-2" />
              {isGenerating ? 'Preparing...' : 'Share WA'}
            </Button>
            <Button onClick={handlePrint} className="bg-red-600 hover:bg-red-700">
              <Printer className="w-4 h-4 mr-2" />
              Print Report
            </Button>"""

content = content.replace(button_insertion, new_button_insertion)

with open('src/pages/DailyReport.tsx', 'w') as f:
    f.write(content)
