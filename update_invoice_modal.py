import re

with open('src/components/InvoiceDetailModal.tsx', 'r') as f:
    content = f.read()

# 1. Add Printer and PrintOrderView imports
content = content.replace("import { format } from 'date-fns';",
                          "import { format } from 'date-fns';\nimport { Printer } from 'lucide-react';\nimport { PrintOrderView } from '@/src/components/PrintOrderView';")

# 2. Add outlets to state so we can pass them to PrintOrderView
content = content.replace("const [loading, setLoading] = useState(true);",
                          "const [loading, setLoading] = useState(true);\n  const [outletsList, setOutletsList] = useState<Outlet[]>([]);")

content = content.replace("fetchPayments()\n        ]);",
                          "fetchPayments()\n        ]);\n        setOutletsList(outlets);")

# 3. Add Print Button next to Close
old_close = """<Button variant="outline" size="sm" onClick={onClose}>Close</Button>"""
new_close = """<div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="print:hidden">
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
            <Button variant="outline" size="sm" onClick={onClose} className="print:hidden">Close</Button>
          </div>"""
content = content.replace(old_close, new_close)

# 4. Hide the modal in print mode except for the PrintOrderView, wait, if we include PrintOrderView, we should hide the modal content in print mode.
content = content.replace("""<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">""",
                          """<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 print:bg-transparent print:p-0">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden print:shadow-none print:max-h-none print:overflow-visible">""")

content = content.replace("""<div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">""",
                          """<PrintOrderView sale={invoice} outlets={outletsList} />
        
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 print:hidden">""")

content = content.replace("""<div className="p-6 overflow-y-auto flex-1 space-y-6">""",
                          """<div className="p-6 overflow-y-auto flex-1 space-y-6 print:hidden">""")

with open('src/components/InvoiceDetailModal.tsx', 'w') as f:
    f.write(content)
