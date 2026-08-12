import re

with open('src/pages/Outlets.tsx', 'r') as f:
    content = f.read()

# Make the row clickable
old_row = """<div key={outlet.ID} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-gray-50/50 transition-colors">"""
new_row = """<div 
                    key={outlet.ID} 
                    className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => { setEditingOutlet(outlet); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >"""
content = content.replace(old_row, new_row)

# Prevent delete button from triggering the row click
old_delete = """<Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(outlet.ID)}>"""
new_delete = """<Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={(e) => { e.stopPropagation(); handleDelete(outlet.ID); }}>"""
content = content.replace(old_delete, new_delete)

# Same for Edit button just in case
old_edit = """<Button variant="ghost" size="sm" onClick={() => { setEditingOutlet(outlet); setIsEditing(true); }}>"""
new_edit = """<Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingOutlet(outlet); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>"""
content = content.replace(old_edit, new_edit)

with open('src/pages/Outlets.tsx', 'w') as f:
    f.write(content)
