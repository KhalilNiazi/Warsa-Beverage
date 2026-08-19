import re

with open('src/components/PrintOrderView.tsx', 'r') as f:
    content = f.read()

# Replace all red with dark gray
content = content.replace('#e61c24', '#374151')
content = content.replace('bg-[#e61c24]', 'bg-[#374151]')
content = content.replace('text-[#e61c24]', 'text-[#374151]')
content = content.replace('border-[#e61c24]', 'border-[#374151]')
content = content.replace('fill-[#e61c24]', 'fill-[#374151]')
content = content.replace('bg-[#fceeed]', 'bg-gray-100')

with open('src/components/PrintOrderView.tsx', 'w') as f:
    f.write(content)
