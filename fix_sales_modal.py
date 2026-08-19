import re

with open('src/pages/Sales.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace("import { FileText, Plus, Receipt, User, Clock, CheckCircle } from 'lucide-react';",
                          "import { FileText, Plus, Receipt, User, Clock, CheckCircle } from 'lucide-react';\nimport { ResponsiveDialog } from '@/src/components/ui/responsive-dialog';")

target = """      {isRecording && (
        <Card className="border-slate-200/60 shadow-md">
          <CardHeader>
            <CardTitle>New Order</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRecordSale} className="space-y-6">"""

replacement = """      <ResponsiveDialog 
        isOpen={isRecording} 
        onClose={() => setIsRecording(false)} 
        title="New Order"
      >
        <form onSubmit={handleRecordSale} className="space-y-6 pb-12 md:pb-0">"""

content = content.replace(target, replacement)

# Replace the closing tags
target_end = """              </form>
            </CardContent>
          </Card>
        )}"""

replacement_end = """        </form>
      </ResponsiveDialog>
      )}"""

content = content.replace(target_end, replacement_end)

with open('src/pages/Sales.tsx', 'w') as f:
    f.write(content)
