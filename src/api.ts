import { InventoryItem, SaleRecord, Outlet, PaymentRecord, OrderBooker } from './types';

const SETTINGS_KEY = 'warsa_settings';
const MOCK_INVENTORY_KEY = 'warsa_mock_inventory_empty';
const MOCK_SALES_KEY = 'warsa_mock_sales';
const MOCK_OUTLETS_KEY = 'warsa_mock_outlets';
const MOCK_PAYMENTS_KEY = 'warsa_mock_payments';

export const getSettings = () => {
  const settings = localStorage.getItem(SETTINGS_KEY);
  return settings ? JSON.parse(settings) : { appsScriptUrl: '' };
};

export const saveSettings = (url: string) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ appsScriptUrl: url }));
};

const getMockInventory = (): InventoryItem[] => {
  const data = localStorage.getItem(MOCK_INVENTORY_KEY);
  if (data) return JSON.parse(data);
  const initial: InventoryItem[] = [];
  localStorage.setItem(MOCK_INVENTORY_KEY, JSON.stringify(initial));
  return initial;
};

const getMockSales = (): SaleRecord[] => {
  const data = localStorage.getItem(MOCK_SALES_KEY);
  if (data) return JSON.parse(data);
  return [];
};

const getMockOutlets = (): Outlet[] => {
  const data = localStorage.getItem(MOCK_OUTLETS_KEY);
  if (data) return JSON.parse(data);
  const initial: Outlet[] = [
    {
      ID: '1',
      Code: '30',
      Name: 'AA ENTERPRISES RAILWAY PAKISTAN',
      Route: 'RAILWAY + G SHAHU + BIBI PAK',
      Address: 'RAILWAY STATION',
      ContactNumber: '0336-4574227',
      OwnerName: 'SHARJEEL SB, ADNAN SB',
      OB: 'AOUN ALI',
      Status: 'General trader',
      CustomRates: {
        '3': 370,
        '4': 370
      }
    }
  ];
  localStorage.setItem(MOCK_OUTLETS_KEY, JSON.stringify(initial));
  return initial;
};

export const fetchInventory = async (): Promise<InventoryItem[]> => {
  const { appsScriptUrl } = getSettings();
  if (!appsScriptUrl) return getMockInventory();

  try {
    const res = await fetch(`${appsScriptUrl}?action=getInventory`);
    const json = await res.json();
    if (json.success) return json.data;
    throw new Error(json.error || 'Failed to fetch');
  } catch (err) {
    console.error("Using fallback data due to fetch error:", err);
    return getMockInventory();
  }
};

export const saveInventoryItem = async (item: InventoryItem): Promise<void> => {
  const { appsScriptUrl } = getSettings();
  if (!appsScriptUrl) {
    const inv = getMockInventory();
    const existing = inv.findIndex(i => i.ID === item.ID);
    if (existing >= 0) {
      inv[existing] = { ...item, LastUpdated: new Date().toISOString() };
    } else {
      inv.push({ ...item, LastUpdated: new Date().toISOString() });
    }
    localStorage.setItem(MOCK_INVENTORY_KEY, JSON.stringify(inv));
    return;
  }

  const res = await fetch(`${appsScriptUrl}?action=saveInventory`, {
    method: 'POST',
    body: JSON.stringify(item),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to save');
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  const { appsScriptUrl } = getSettings();
  if (!appsScriptUrl) {
    const inv = getMockInventory();
    localStorage.setItem(MOCK_INVENTORY_KEY, JSON.stringify(inv.filter(i => i.ID !== id)));
    return;
  }

  const res = await fetch(`${appsScriptUrl}?action=deleteInventory`, {
    method: 'POST',
    body: JSON.stringify({ ID: id }),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to delete');
};

export const fetchSales = async (): Promise<SaleRecord[]> => {
  const { appsScriptUrl } = getSettings();
  if (!appsScriptUrl) return getMockSales();

  try {
    const res = await fetch(`${appsScriptUrl}?action=getSales`);
    const json = await res.json();
    if (json.success) return json.data;
    throw new Error(json.error || 'Failed to fetch sales');
  } catch (err) {
    console.error("Using fallback data due to fetch error:", err);
    return getMockSales();
  }
};

export const addSaleRecord = async (sale: SaleRecord): Promise<void> => {
  const { appsScriptUrl } = getSettings();
  if (!appsScriptUrl) {
    const sales = getMockSales();
    sales.push(sale);
    localStorage.setItem(MOCK_SALES_KEY, JSON.stringify(sales));
    
    const inv = getMockInventory();
    sale.Items.forEach(saleItem => {
      const itemIndex = inv.findIndex(i => i.ID === saleItem.ProductID);
      if (itemIndex >= 0) {
        inv[itemIndex].Quantity = Math.max(0, inv[itemIndex].Quantity - saleItem.Quantity);
        inv[itemIndex].LastUpdated = new Date().toISOString();
      }
    });
    localStorage.setItem(MOCK_INVENTORY_KEY, JSON.stringify(inv));
    return;
  }

  const res = await fetch(`${appsScriptUrl}?action=addSale`, {
    method: 'POST',
    body: JSON.stringify(sale),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to record sale');
};


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

export const fetchOutlets = async (): Promise<Outlet[]> => {
  const { appsScriptUrl } = getSettings();
  if (!appsScriptUrl) return getMockOutlets();

  try {
    const res = await fetch(`${appsScriptUrl}?action=getOutlets`);
    const json = await res.json();
    if (json.success) return json.data;
    throw new Error(json.error || 'Failed to fetch outlets');
  } catch (err) {
    console.error("Using fallback data due to fetch error:", err);
    return getMockOutlets();
  }
};

export const saveOutlet = async (outlet: Outlet): Promise<void> => {
  const { appsScriptUrl } = getSettings();
  if (!appsScriptUrl) {
    const outlets = getMockOutlets();
    const existing = outlets.findIndex(o => o.ID === outlet.ID);
    if (existing >= 0) {
      outlets[existing] = outlet;
    } else {
      outlets.push(outlet);
    }
    localStorage.setItem(MOCK_OUTLETS_KEY, JSON.stringify(outlets));
    return;
  }

  const res = await fetch(`${appsScriptUrl}?action=saveOutlet`, {
    method: 'POST',
    body: JSON.stringify(outlet),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to save outlet');
};

export const deleteOutlet = async (id: string): Promise<void> => {
  const { appsScriptUrl } = getSettings();
  if (!appsScriptUrl) {
    const outlets = getMockOutlets();
    localStorage.setItem(MOCK_OUTLETS_KEY, JSON.stringify(outlets.filter(o => o.ID !== id)));
    return;
  }

  const res = await fetch(`${appsScriptUrl}?action=deleteOutlet`, {
    method: 'POST',
    body: JSON.stringify({ ID: id }),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to delete outlet');
};

const getMockPayments = (): PaymentRecord[] => {
  const data = localStorage.getItem(MOCK_PAYMENTS_KEY);
  if (data) return JSON.parse(data);
  return [];
};

export const fetchPayments = async (): Promise<PaymentRecord[]> => {
  const { appsScriptUrl } = getSettings();
  if (!appsScriptUrl) return getMockPayments();

  try {
    const res = await fetch(`${appsScriptUrl}?action=getPayments`);
    const json = await res.json();
    if (json.success) return json.data;
    throw new Error(json.error || 'Failed to fetch payments');
  } catch (err) {
    console.error("Using fallback data due to fetch error:", err);
    return getMockPayments();
  }
};

export const addPaymentRecord = async (payment: PaymentRecord): Promise<void> => {
  const { appsScriptUrl } = getSettings();
  if (!appsScriptUrl) {
    const payments = getMockPayments();
    payments.push(payment);
    localStorage.setItem(MOCK_PAYMENTS_KEY, JSON.stringify(payments));
    return;
  }

  const res = await fetch(`${appsScriptUrl}?action=addPayment`, {
    method: 'POST',
    body: JSON.stringify(payment),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to record payment');
};

const MOCK_OBS_KEY = 'warsa_mock_obs';

export const fetchOrderBookers = async (): Promise<OrderBooker[]> => {
  const data = localStorage.getItem(MOCK_OBS_KEY);
  if (data) return JSON.parse(data);
  return [];
};

export const saveOrderBooker = async (ob: OrderBooker): Promise<void> => {
  const obs = await fetchOrderBookers();
  const existingIndex = obs.findIndex(o => o.ID === ob.ID);
  
  if (existingIndex >= 0) {
    obs[existingIndex] = ob;
  } else {
    obs.push({ ...ob, ID: Date.now().toString() });
  }
  
  localStorage.setItem(MOCK_OBS_KEY, JSON.stringify(obs));
};

export const deleteOrderBooker = async (id: string): Promise<void> => {
  const obs = await fetchOrderBookers();
  localStorage.setItem(MOCK_OBS_KEY, JSON.stringify(obs.filter(o => o.ID !== id)));
};
