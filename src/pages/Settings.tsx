import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { getSettings, saveSettings } from '@/src/api';
import { Save, CheckCircle2, Copy, Code } from 'lucide-react';

const APPS_SCRIPT_CODE = `
const INVENTORY_SHEET = 'Inventory';
const SALES_SHEET = 'Sales';

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  let invSheet = ss.getSheetByName(INVENTORY_SHEET);
  if (!invSheet) {
    invSheet = ss.insertSheet(INVENTORY_SHEET);
    invSheet.appendRow(['ID', 'Name', 'SKU', 'Quantity', 'Price', 'MinThreshold', 'LastUpdated']);
  }
  
  let salesSheet = ss.getSheetByName(SALES_SHEET);
  if (!salesSheet) {
    salesSheet = ss.insertSheet(SALES_SHEET);
    salesSheet.appendRow(['ID', 'Date', 'ProductID', 'ProductName', 'Quantity', 'TotalPrice']);
  }
}

function doPost(e) {
  return handleRequest(e, true);
}

function doGet(e) {
  return handleRequest(e, false);
}

function handleRequest(e, isPost) {
  try {
    const action = e.parameter.action;
    let data = {};
    if (isPost && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
    
    let result = { success: false, message: 'Unknown action' };
    
    if (action === 'getInventory') result = getInventory();
    else if (action === 'saveInventory') result = saveInventory(data);
    else if (action === 'deleteInventory') result = deleteInventory(data);
    else if (action === 'getSales') result = getSales();
    else if (action === 'addSale') result = addSale(data);
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error: any) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getInventory() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(INVENTORY_SHEET);
  if (!sheet) return { success: false, error: 'Sheet not found' };
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: [] };
  
  const headers = data[0];
  const items = data.slice(1).map(row => {
    let obj: any = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
  return { success: true, data: items };
}

function saveInventory(item: any) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(INVENTORY_SHEET);
  if (!sheet) return { success: false, error: 'Sheet not found' };
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(item.ID)) {
      sheet.getRange(i + 1, 1, 1, 7).setValues([[
        item.ID, item.Name, item.SKU, item.Quantity, item.Price, item.MinThreshold, new Date().toISOString()
      ]]);
      return { success: true, message: 'Updated' };
    }
  }
  
  sheet.appendRow([item.ID, item.Name, item.SKU, item.Quantity, item.Price, item.MinThreshold, new Date().toISOString()]);
  return { success: true, message: 'Added' };
}

function deleteInventory(data: any) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(INVENTORY_SHEET);
  if (!sheet) return { success: false, error: 'Sheet not found' };
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.ID)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
}

function addSale(sale: any) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const salesSheet = ss.getSheetByName(SALES_SHEET);
  if (!salesSheet) return { success: false, error: 'Sheet not found' };
  
  salesSheet.appendRow([
    sale.ID, sale.Date, sale.ProductID, sale.ProductName, sale.Quantity, sale.TotalPrice
  ]);
  
  const invSheet = ss.getSheetByName(INVENTORY_SHEET);
  if (!invSheet) return { success: false, error: 'Sheet not found' };
  const data = invSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(sale.ProductID)) {
      const newQty = Math.max(0, data[i][3] - sale.Quantity);
      invSheet.getRange(i + 1, 4).setValue(newQty);
      invSheet.getRange(i + 1, 7).setValue(new Date().toISOString());
      break;
    }
  }
  return { success: true };
}

function getSales() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SALES_SHEET);
  if (!sheet) return { success: false, error: 'Sheet not found' };
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: [] };
  
  const headers = data[0];
  const items = data.slice(1).map(row => {
    let obj: any = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
  return { success: true, data: items };
}
`;

export function SettingsPage() {
  const [url, setUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    setUrl(settings.appsScriptUrl || '');
  }, []);

  const handleSave = () => {
    saveSettings(url.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-4 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">Configure your Google Sheets integration.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Google Apps Script Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Apps Script Web App URL</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1"
              />
              <Button onClick={handleSave} className="gap-2 w-full sm:w-[120px]">
                {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save</>}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Leave empty to use local storage (mock data). Once connected, all data will sync with your Google Sheet.
            </p>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Code className="h-5 w-5 text-blue-600" /> Setup Instructions
            </h3>
            
            <ol className="list-decimal list-inside space-y-4 text-gray-700 text-sm">
              <li>Create a new Google Sheet.</li>
              <li>Go to <strong>Extensions &gt; Apps Script</strong>.</li>
              <li>Delete any code in the editor and paste the code below.</li>
              <li>In the toolbar, select the <strong>setup</strong> function and click <strong>Run</strong> (this creates the sheets). You'll need to authorize it.</li>
              <li>Click <strong>Deploy &gt; New deployment</strong>.</li>
              <li>Select <strong>Web app</strong> type (click the gear icon).</li>
              <li>Set <strong>Execute as</strong> to <strong>Me</strong>.</li>
              <li>Set <strong>Who has access</strong> to <strong>Anyone</strong>.</li>
              <li>Click <strong>Deploy</strong> and copy the provided Web app URL into the field above.</li>
            </ol>
          </div>

          <div className="relative mt-6">
            <div className="absolute right-2 top-2">
              <Button variant="secondary" size="sm" onClick={handleCopy} className="gap-2 h-8">
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed max-h-96">
              <code>{APPS_SCRIPT_CODE}</code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
