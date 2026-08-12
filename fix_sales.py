import re

with open('src/pages/Sales.tsx', 'r') as f:
    content = f.read()

# Remove the inline PrintOrderView component completely
match = re.search(r'const PrintOrderView = \(\{ sale, outlets \}: \{ sale: SaleRecord \| null, outlets: Outlet\[\] \}\) => \{.*?^};$', content, re.MULTILINE | re.DOTALL)
if match:
    content = content.replace(match.group(0), "import { PrintOrderView } from '@/src/components/PrintOrderView';")

with open('src/pages/Sales.tsx', 'w') as f:
    f.write(content)
