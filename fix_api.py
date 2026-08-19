import re

with open('src/api.ts', 'r') as f:
    content = f.read()

new_functions = """
export const updateSale = async (sale: SaleRecord): Promise<void> => {
  const { appsScriptUrl } = getSettings();
  if (!appsScriptUrl) {
    const sales = getMockSales();
    const index = sales.findIndex(s => s.ID === sale.ID);
    if (index >= 0) {
      sales[index] = sale;
      localStorage.setItem(MOCK_SALES_KEY, JSON.stringify(sales));
    }
    return;
  }
  const res = await fetch(`${appsScriptUrl}?action=updateSale`, {
    method: 'POST',
    body: JSON.stringify(sale),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to update sale');
};

export const deleteSale = async (id: string): Promise<void> => {
  const { appsScriptUrl } = getSettings();
  if (!appsScriptUrl) {
    const sales = getMockSales();
    localStorage.setItem(MOCK_SALES_KEY, JSON.stringify(sales.filter(s => s.ID !== id)));
    return;
  }
  const res = await fetch(`${appsScriptUrl}?action=deleteSale`, {
    method: 'POST',
    body: JSON.stringify({ ID: id }),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to delete sale');
};
"""

content = content.replace("export const fetchOutlets", new_functions + "\nexport const fetchOutlets")

with open('src/api.ts', 'w') as f:
    f.write(content)
