import re

with open('src/components/InvoiceDetailModal.tsx', 'r') as f:
    content = f.read()

target = """<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 print:bg-transparent print:p-0">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden print:shadow-none print:max-h-none print:overflow-visible">"""

replacement = """<div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4 bg-black/60 print:bg-transparent print:p-0">
      <div className="bg-white rounded-t-2xl md:rounded-xl shadow-xl w-full md:w-auto md:min-w-[600px] max-w-2xl max-h-[90dvh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 md:zoom-in-95 duration-200 print:shadow-none print:max-h-none print:overflow-visible">"""

content = content.replace(target, replacement)

with open('src/components/InvoiceDetailModal.tsx', 'w') as f:
    f.write(content)
