import re

with open('src/pages/Inventory.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { cn } from '@/src/lib/utils';",
                          "import { cn } from '@/src/lib/utils';\nimport { ConfirmDialog } from '@/src/components/ui/confirm-dialog';")

with open('src/pages/Inventory.tsx', 'w') as f:
    f.write(content)
