import re

with open('src/pages/OrderBookers.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace("import { ResponsiveDialog } from '@/src/components/ui/responsive-dialog';",
                          "import { ResponsiveDialog } from '@/src/components/ui/responsive-dialog';\nimport { ConfirmDialog } from '@/src/components/ui/confirm-dialog';")

# Add state
state_target = "const [editingOB, setEditingOB] = useState<Partial<OrderBooker>>({});"
state_replacement = "const [editingOB, setEditingOB] = useState<Partial<OrderBooker>>({});\n  const [obToDelete, setObToDelete] = useState<string | null>(null);"
content = content.replace(state_target, state_replacement)

# Replace handleDelete
handle_target = """  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this order booker?')) {
      await deleteOrderBooker(id);
      loadData();
    }
  };"""
handle_replacement = """  const handleDelete = async () => {
    if (obToDelete) {
      await deleteOrderBooker(obToDelete);
      setObToDelete(null);
      loadData();
    }
  };"""
content = content.replace(handle_target, handle_replacement)

# Replace onClick in render
content = content.replace("onClick={() => handleDelete(ob.ID)}", "onClick={() => setObToDelete(ob.ID)}")

# Add ConfirmDialog before closing tag
dialog = """      <ConfirmDialog
        isOpen={!!obToDelete}
        title="Delete Order Booker"
        description="Are you sure you want to delete this order booker? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setObToDelete(null)}
      />"""

content = content.replace("    </div>\n  );\n}", dialog + "\n    </div>\n  );\n}")

with open('src/pages/OrderBookers.tsx', 'w') as f:
    f.write(content)
