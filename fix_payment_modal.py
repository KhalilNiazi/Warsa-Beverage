import re

with open('src/components/PaymentDetailModal.tsx', 'r') as f:
    content = f.read()

target = """<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col overflow-hidden">"""

replacement = """<div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4 bg-black/60">
      <div className="bg-white rounded-t-2xl md:rounded-xl shadow-xl w-full md:w-auto md:min-w-[400px] max-w-md max-h-[90dvh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 md:zoom-in-95 duration-200">"""

content = content.replace(target, replacement)

with open('src/components/PaymentDetailModal.tsx', 'w') as f:
    f.write(content)
