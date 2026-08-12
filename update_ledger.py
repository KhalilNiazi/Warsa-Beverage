import re

with open('src/pages/Ledger.tsx', 'r') as f:
    content = f.read()

# 1. Add PaymentDetailModal import
content = content.replace("import { InvoiceDetailModal } from '@/src/components/InvoiceDetailModal';", 
                          "import { InvoiceDetailModal } from '@/src/components/InvoiceDetailModal';\nimport { PaymentDetailModal } from '@/src/components/PaymentDetailModal';")

# 2. Add state variables
content = content.replace("const [paymentAmount, setPaymentAmount] = useState('');",
                          "const [paymentAmount, setPaymentAmount] = useState('');\n  const [paymentType, setPaymentType] = useState<'RECEIPT' | 'RETURN'>('RECEIPT');\n  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);")

# 3. Update handleAddPayment
old_handleAddPayment = """
  const handleAddPayment = async () => {
    if (!selectedOutletId || !paymentAmount) return;
    
    try {
      const newPayment: PaymentRecord = {
        ID: `PAY-${Date.now()}`,
        Date: new Date().toISOString(),
        OutletID: selectedOutletId,
        Amount: Number(paymentAmount),
        Notes: paymentNotes
      };
      
      await addPaymentRecord(newPayment);
      
      setPaymentAmount('');
      setPaymentNotes('');
      setIsAddingPayment(false);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };
"""

new_handleAddPayment = """
  const handleAddPayment = async () => {
    if (!selectedOutletId || !paymentAmount) return;
    
    try {
      const newPayment: PaymentRecord = {
        ID: `PAY-${Date.now()}`,
        Date: new Date().toISOString(),
        OutletID: selectedOutletId,
        Amount: Number(paymentAmount),
        Notes: paymentNotes,
        Type: paymentType
      };
      
      await addPaymentRecord(newPayment);
      
      setPaymentAmount('');
      setPaymentNotes('');
      setIsAddingPayment(false);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };
"""
content = content.replace(old_handleAddPayment.strip(), new_handleAddPayment.strip())

# 4. Update ledger calculation to handle RETURN
content = content.replace("currentBalance -= payment.Amount;", 
                          """if (payment.Type === 'RETURN') {
          currentBalance += payment.Amount;
        } else {
          currentBalance -= payment.Amount;
        }""")

content = content.replace("credit: 0,", "credit: payment.Type === 'RETURN' ? payment.Amount : 0,")
content = content.replace("debit: payment.Amount, // Amount reducing their debt", "debit: payment.Type === 'RETURN' ? 0 : payment.Amount, // Amount reducing their debt")
content = content.replace("description: payment.Notes || 'Cash Receipt',", "description: payment.Notes || (payment.Type === 'RETURN' ? 'Cash Return' : 'Cash Receipt'),")

# 5. Add Cash Return button next to Receive Cash
old_buttons = """
                    <Button 
                      variant="secondary" 
                      className="w-full bg-white text-red-600 hover:bg-gray-100"
                      onClick={() => setIsAddingPayment(!isAddingPayment)}
                    >
                      {isAddingPayment ? 'Cancel' : 'Receive Cash'}
                    </Button>
"""
new_buttons = """
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="secondary" 
                        className="flex-1 bg-white text-red-600 hover:bg-gray-100 px-2"
                        onClick={() => { setIsAddingPayment(true); setPaymentType('RECEIPT'); }}
                      >
                        Receive Cash
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="flex-1 bg-white text-blue-600 hover:bg-gray-100 px-2"
                        onClick={() => { setIsAddingPayment(true); setPaymentType('RETURN'); }}
                      >
                        Cash Return
                      </Button>
                    </div>
"""
content = content.replace(old_buttons.strip(), new_buttons.strip())

# 6. Update Form UI to show type
old_form_title = """<CardTitle className="text-md flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-red-600" /> 
                      New Payment from {selectedOutlet.Name}
                    </CardTitle>"""
new_form_title = """<CardTitle className="text-md flex items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <DollarSign className={`h-4 w-4 ${paymentType === 'RETURN' ? 'text-blue-600' : 'text-red-600'}`} /> 
                        {paymentType === 'RETURN' ? 'Cash Return to' : 'New Payment from'} {selectedOutlet.Name}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setIsAddingPayment(false)}>Cancel</Button>
                    </CardTitle>"""
content = content.replace(old_form_title, new_form_title)

# 7. Add click handler for PAYMENT
content = content.replace("className={`hover:bg-gray-50/50 transition-colors ${entry.type === 'SALE' ? 'cursor-pointer' : ''}`}",
                          "className={`hover:bg-gray-50/50 transition-colors cursor-pointer`}")

old_onClick = """onClick={() => {
                              if (entry.type === 'SALE') {
                                setSelectedInvoiceId(entry.id);
                              }
                            }}"""
new_onClick = """onClick={() => {
                              if (entry.type === 'SALE') {
                                setSelectedInvoiceId(entry.id);
                              } else if (entry.type === 'PAYMENT') {
                                setSelectedPaymentId(entry.id);
                              }
                            }}"""
content = content.replace(old_onClick, new_onClick)

# 8. Render Payment Detail Modal
content = content.replace("const selectedInvoice = sales.find(s => s.ID === selectedInvoiceId);",
                          "const selectedInvoice = sales.find(s => s.ID === selectedInvoiceId);\n  const selectedPayment = payments.find(p => p.ID === selectedPaymentId);")

content = content.replace("</>\n          )}\n        </div>",
                          """</>
          )}
        </div>
        
        {selectedPayment && (
          <PaymentDetailModal payment={selectedPayment} onClose={() => setSelectedPaymentId(null)} />
        )}""")

with open('src/pages/Ledger.tsx', 'w') as f:
    f.write(content)
