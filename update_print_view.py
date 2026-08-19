import re

with open('src/components/PrintOrderView.tsx', 'r') as f:
    content = f.read()

# 1. Remove QrCode import and usage
content = content.replace("import { QrCode } from 'lucide-react';", "")
content = content.replace("MessageCircle, QrCode", "MessageCircle")
content = re.sub(r'<div className="bg-white p-1 rounded-sm"><QrCode.*?</div>', '', content)

# 2. Make back color dark gray instead of red in the footer
# Wait, the user said: "make black color dark gray insted of red"
# The footer has a black background `bg-[#1a1a1a]` and a red polygon `bg-[#e61c24]`.
# Let's change the red polygon in the footer to a dark gray.
content = re.sub(
    r'<div\s*className="absolute inset-y-0 right-0 w-\[85%\] bg-\[#e61c24\] z-0"',
    r'<div \n          className="absolute inset-y-0 right-0 w-[85%] bg-[#4b5563] z-0"', # tailwind gray-600
    content
)

# 3. Remove watermark
content = re.sub(r'<div className="absolute inset-0 flex items-center justify-center pointer-events-none pr-8">\s*<WatermarkSVG />\s*</div>', '', content)
# Since WatermarkSVG is no longer used, we can leave the definition or remove it. We'll leave it for safety or remove if easy.

# 4. Use invoice no instead of Original
content = content.replace('uppercase text-[12px]">Original</td>', 'uppercase text-[12px]">{sale.ID}</td>')

# 5. Side by side invoices
# First, extract the content inside the return statement into a local functional component.
# Actually, I can just replace the return block.

with open('src/components/PrintOrderView.tsx', 'w') as f:
    f.write(content)
