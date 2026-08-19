import re

with open('src/pages/Inventory.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace("import { ResponsiveDialog } from '@/src/components/ui/responsive-dialog';",
                          "import { ResponsiveDialog } from '@/src/components/ui/responsive-dialog';\nimport { ConfirmDialog } from '@/src/components/ui/confirm-dialog';")

# Add state
state_target = "const [search, setSearch] = useState('');"
state_replacement = "const [search, setSearch] = useState('');\n  const [itemToDelete, setItemToDelete] = useState<string | null>(null);"
content = content.replace(state_target, state_replacement)

# Replace handleDelete
handle_target = """  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteInventoryItem(id);
      loadData();
    }
  };"""
handle_replacement = """  const handleDelete = async () => {
    if (itemToDelete) {
      await deleteInventoryItem(itemToDelete);
      setItemToDelete(null);
      loadData();
    }
  };"""
content = content.replace(handle_target, handle_replacement)

# Replace onClick in render
content = content.replace("onClick={() => handleDelete(item.ID)}", "onClick={() => setItemToDelete(item.ID)}")

# Add ConfirmDialog before closing tag
dialog = """      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
      />"""

content = content.replace("    </div>\n  );\n}", dialog + "\n    </div>\n  );\n}")

with open('src/pages/Inventory.tsx', 'w') as f:
    f.write(content)
