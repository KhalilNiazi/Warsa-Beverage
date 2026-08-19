import re

with open('src/pages/Sales.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { PrintOrderView } from '@/src/components/PrintOrderView';",
                          "import { PrintOrderView } from '@/src/components/PrintOrderView';\nimport { ResponsiveDialog } from '@/src/components/ui/responsive-dialog';")

with open('src/pages/Sales.tsx', 'w') as f:
    f.write(content)
