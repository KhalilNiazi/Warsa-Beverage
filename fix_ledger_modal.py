import re

with open('src/pages/Ledger.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace("import { Store, Calendar, FileText, ChevronRight, DollarSign, TrendingUp, Package, ArrowDownRight, ArrowUpRight, Plus, Search } from 'lucide-react';",
                          "import { Store, Calendar, FileText, ChevronRight, DollarSign, TrendingUp, Package, ArrowDownRight, ArrowUpRight, Plus, Search } from 'lucide-react';\nimport { ResponsiveDialog } from '@/src/components/ui/responsive-dialog';")

target = """              {/* Add Payment Form */}
              {isAddingPayment && (
                <Card className="border-red-200 shadow-sm">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-md flex items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <DollarSign className={`h-4 w-4 ${paymentType === 'RETURN' ? 'text-blue-600' : 'text-red-600'}`} /> 
                        {paymentType === 'RETURN' ? 'Cash Return to' : 'New Payment from'} {selectedOutlet.Name}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setIsAddingPayment(false)}>Cancel</Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase">Amount (Rs)</label>
                        <Input 
                          type="number" 
                          placeholder="e.g. 5000" 
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase">Notes / Ref</label>
                        <Input 
                          placeholder="e.g. Cash handed over" 
                          value={paymentNotes}
                          onChange={(e) => setPaymentNotes(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button onClick={handleAddPayment} className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                        Save Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}"""

replacement = """              {/* Add Payment Form */}
              <ResponsiveDialog 
                isOpen={isAddingPayment} 
                onClose={() => setIsAddingPayment(false)}
                title={`${paymentType === 'RETURN' ? 'Cash Return to' : 'New Payment from'} ${selectedOutlet.Name}`}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-600 uppercase">Amount (Rs)</label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 5000" 
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-600 uppercase">Notes / Ref</label>
                      <Input 
                        placeholder="e.g. Cash handed over" 
                        value={paymentNotes}
                        onChange={(e) => setPaymentNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsAddingPayment(false)}>Cancel</Button>
                    <Button onClick={handleAddPayment} className="bg-red-600 hover:bg-red-700">
                      Save Payment
                    </Button>
                  </div>
                </div>
              </ResponsiveDialog>"""

content = content.replace(target, replacement)

with open('src/pages/Ledger.tsx', 'w') as f:
    f.write(content)
