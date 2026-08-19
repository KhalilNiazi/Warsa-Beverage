import re

with open('src/pages/DailyReport.tsx', 'r') as f:
    content = f.read()

# Replace Tailwind color classes that use oklch with hex equivalents
content = content.replace('text-black', 'text-[#000]')
content = content.replace('bg-white', 'bg-[#fff]')
content = content.replace('border-black', 'border-[#000]')
content = content.replace('text-white', 'text-[#fff]')
content = content.replace('text-red-900', 'text-[#7f1d1d]')
content = content.replace('text-gray-500', 'text-[#6b7280]')
content = content.replace('print:bg-white', 'print:bg-[#fff]')

with open('src/pages/DailyReport.tsx', 'w') as f:
    f.write(content)
