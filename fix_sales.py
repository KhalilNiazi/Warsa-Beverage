import re

with open('src/pages/Sales.tsx', 'r') as f:
    content = f.read()

# Fix import
content = content.replace("fetchSales, addSaleRecord, fetchOutlets", "fetchSales, addSaleRecord, fetchOutlets, updateSale, deleteSale")
if "import { ConfirmDialog }" not in content:
    content = content.replace("import { ResponsiveDialog } from '@/src/components/ui/responsive-dialog';", "import { ResponsiveDialog } from '@/src/components/ui/responsive-dialog';\nimport { ConfirmDialog } from '@/src/components/ui/confirm-dialog';")

# Add new states
state_target = "const [discount, setDiscount] = useState<number>(0);"
state_replacement = "const [discount, setDiscount] = useState<number>(0);\n  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);\n  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);"
content = content.replace(state_target, state_replacement)

# Add handleEdit and handleDelete
handle_methods = """
  const handleEdit = (sale: SaleRecord) => {
    setEditingSaleId(sale.ID);
    
    // Find outlet id by matching name or address
    const outlet = outlets.find(o => o.Name === sale.OutletName || o.Address === sale.Address);
    setSelectedOutletId(outlet ? outlet.ID : '');
    
    setOutletName(sale.OutletName);
    setRoute(sale.Route);
    setAddress(sale.Address);
    setContactNumber(sale.ContactNumber || '');
    setOwnerName(sale.OwnerName || '');
    setStatus(sale.Status || '');
    
    setDiscount(sale.Discount);
    
    // Map Items to orderItems
    const newOrderItems = sale.Items.map(item => ({
      product: item.ProductID || '',
      qty: item.Quantity
    }));
    setOrderItems(newOrderItems);
    
    setIsRecording(true);
  };

  const handleDelete = async () => {
    if (saleToDelete) {
      await deleteSale(saleToDelete);
      setSaleToDelete(null);
      loadData();
    }
  };
"""

content = content.replace("const handleRecordSale = async (e: React.FormEvent) => {", handle_methods + "\n  const handleRecordSale = async (e: React.FormEvent) => {")

# Update handleRecordSale
record_sale_target = """    const sale: SaleRecord = {
      ID: Math.floor(Math.random() * 100000).toString(), // Mock Order #
      Date: new Date().toISOString(),"""
record_sale_replacement = """    const sale: SaleRecord = {
      ID: editingSaleId || Math.floor(Math.random() * 100000).toString(), // Mock Order #
      Date: editingSaleId ? (sales.find(s => s.ID === editingSaleId)?.Date || new Date().toISOString()) : new Date().toISOString(),"""
content = content.replace(record_sale_target, record_sale_replacement)

call_api_target = """    setIsRecording(false);
    await addSaleRecord(sale);"""
call_api_replacement = """    setIsRecording(false);
    if (editingSaleId) {
      await updateSale(sale);
    } else {
      await addSaleRecord(sale);
    }
    setEditingSaleId(null);"""
content = content.replace(call_api_target, call_api_replacement)

# Reset form update to also clear editingSaleId
reset_form_target = """    setDiscount(0);
    loadData();"""
reset_form_replacement = """    setDiscount(0);
    setEditingSaleId(null);
    loadData();"""
content = content.replace(reset_form_target, reset_form_replacement)

# Update dialog close to reset editingSaleId
close_dialog_target = """onClose={() => setIsRecording(false)}"""
close_dialog_replacement = """onClose={() => { setIsRecording(false); setEditingSaleId(null); }}"""
content = content.replace(close_dialog_target, close_dialog_replacement)


# Render edit/delete buttons
render_actions_target = """                          <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(sale)} className="text-blue-600 hover:text-blue-800">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setPrintSale(sale)} className="text-slate-600 hover:text-slate-800">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>"""
render_actions_replacement = """                          <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(sale)} className="text-blue-600 hover:text-blue-800">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setPrintSale(sale)} className="text-slate-600 hover:text-slate-800">
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(sale)} className="text-amber-500 hover:text-amber-700">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setSaleToDelete(sale.ID)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>"""
# Need to import Edit2 from lucide-react if not already
if "Edit2" not in content:
    content = content.replace("Plus, Trash2", "Plus, Trash2, Edit2")

content = content.replace(render_actions_target, render_actions_replacement)

render_table_actions_target = """                              <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(sale)} className="text-blue-600 hover:text-blue-800">
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setPrintSale(sale)} className="text-slate-600 hover:text-slate-800">
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>"""
render_table_actions_replacement = """                              <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(sale)} className="text-blue-600 hover:text-blue-800">
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setPrintSale(sale)} className="text-slate-600 hover:text-slate-800">
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(sale)} className="text-amber-500 hover:text-amber-700">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setSaleToDelete(sale.ID)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>"""
content = content.replace(render_table_actions_target, render_table_actions_replacement)


# Add ConfirmDialog at end of Sales component
dialog_str = """      <ConfirmDialog
        isOpen={!!saleToDelete}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setSaleToDelete(null)}
      />"""

content = content.replace("    </div>\n  );\n}", dialog_str + "\n    </div>\n  );\n}")


with open('src/pages/Sales.tsx', 'w') as f:
    f.write(content)
