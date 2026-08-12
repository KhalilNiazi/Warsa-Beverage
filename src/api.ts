import { InventoryItem, SaleRecord, Outlet } from './types';

const SETTINGS_KEY = 'warsa_settings';
const MOCK_INVENTORY_KEY = 'warsa_mock_inventory';
const MOCK_SALES_KEY = 'warsa_mock_sales';
const MOCK_OUTLETS_KEY = 'warsa_mock_outlets';

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
  const initial = [
    { ID: '1', Name: '300ML(24B)', SKU: 'WARSA-300-24', Quantity: 1200, Price: 0, MinThreshold: 100 },
    { ID: '2', Name: '300ML(16B)', SKU: 'WARSA-300-16', Quantity: 800, Price: 0, MinThreshold: 100 },
    { ID: '3', Name: '500 ML', SKU: 'WARSA-500', Quantity: 500, Price: 370, MinThreshold: 50 },
    { ID: '4', Name: '1500 ML', SKU: 'WARSA-1500', Quantity: 200, Price: 370, MinThreshold: 20 },
    { ID: '5', Name: '5. LITER', SKU: 'WARSA-5L', Quantity: 400, Price: 0, MinThreshold: 50 },
    { ID: '6', Name: '19.LITER', SKU: 'WARSA-19L', Quantity: 300, Price: 0, MinThreshold: 30 },
    { ID: '7', Name: 'PROMO 500 ml', SKU: 'WARSA-PROMO-500', Quantity: 100, Price: 0, MinThreshold: 10 },
  ];
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
