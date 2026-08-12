export interface InventoryItem {
  ID: string;
  Name: string;
  SKU: string;
  Quantity: number;
  Price: number;
  MinThreshold: number;
  LastUpdated?: string;
}

export interface InvoiceItem {
  ProductID: string;
  ProductName: string;
  Quantity: number;
  Price: number;
  Amount: number;
}

export interface SaleRecord {
  ID: string;
  Date: string;
  OutletName: string;
  Route: string;
  Address: string;
  ContactNumber: string;
  OwnerName?: string;
  Status?: string;
  Items: InvoiceItem[];
  TotalCases: number;
  TotalAmount: number;
  Discount: number;
  GrandTotal: number;
}

export interface Outlet {
  ID: string;
  Code: string;
  Name: string;
  Route: string;
  Address: string;
  ContactNumber: string;
  OwnerName: string;
  OB: string;
  Status: string;
  CustomRates: Record<string, number>;
  OpeningBalance?: number;
}

export interface PaymentRecord {
  ID: string;
  Date: string;
  OutletID: string;
  Amount: number;
  Notes: string;
  Type?: 'RECEIPT' | 'RETURN';
}

export interface Settings {
  appsScriptUrl: string;
}