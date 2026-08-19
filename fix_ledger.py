with open('src/pages/Ledger.tsx', 'r') as f:
    content = f.read()

if "import { ResponsiveDialog }" not in content:
    content = content.replace("import { PaymentDetailModal } from '@/src/components/PaymentDetailModal';", "import { PaymentDetailModal } from '@/src/components/PaymentDetailModal';\nimport { ResponsiveDialog } from '@/src/components/ui/responsive-dialog';")
    with open('src/pages/Ledger.tsx', 'w') as f:
        f.write(content)
