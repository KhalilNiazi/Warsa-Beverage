import re

with open('src/pages/DailyReport.tsx', 'r') as f:
    content = f.read()

target = '<div ref={reportRef} className="w-full bg-white print:bg-white text-black font-sans text-xs p-4">'
insertion = """<div ref={reportRef} className="w-full bg-white print:bg-white text-black font-sans text-xs p-4">
            <div className="text-center mb-4 font-bold text-lg uppercase tracking-widest border-b-2 border-black pb-2">
              WARSA PURE WATER - DAILY SALES REPORT ({format(parseISO(selectedDate), 'dd MMM yyyy')})
            </div>"""

content = content.replace(target, insertion)

with open('src/pages/DailyReport.tsx', 'w') as f:
    f.write(content)
