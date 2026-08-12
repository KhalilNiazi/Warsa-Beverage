import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { fetchInventory, fetchSales } from '@/src/api';
import { InventoryItem, SaleRecord } from '@/src/types';
import { PackageSearch, AlertTriangle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/src/lib/utils';

export function Dashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [invData, salesData] = await Promise.all([
          fetchInventory(),
          fetchSales()
        ]);
        setInventory(invData);
        setSales(salesData);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const lowStockItems = inventory.filter(item => item.Quantity <= item.MinThreshold);
  const totalStock = inventory.reduce((acc, item) => acc + item.Quantity, 0);
  const totalRevenue = sales.reduce((acc, sale) => acc + (sale.GrandTotal || 0), 0);

  // Group sales by date for chart
  const salesByDate = sales.reduce((acc: any, sale) => {
    const dateStr = format(new Date(sale.Date), 'MMM dd');
    if (!acc[dateStr]) acc[dateStr] = 0;
    acc[dateStr] += (sale.GrandTotal || 0);
    return acc;
  }, {});
  
  const chartData = Object.keys(salesByDate).map(date => ({
    name: date,
    revenue: salesByDate[date]
  })).slice(-7); // last 7 days roughly

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Overview</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">Track your inventory and sales performance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Products</CardTitle>
            <PackageSearch className="h-4 w-4 text-gray-400 hidden sm:block" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-gray-900">{inventory.length}</div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Total Stock</CardTitle>
            <PackageSearch className="h-4 w-4 text-gray-400 hidden sm:block" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-gray-900">{totalStock.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400 hidden sm:block" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-gray-900">PKR {totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className={cn("col-span-2 lg:col-span-1", lowStockItems.length > 0 ? "border-red-200 bg-red-50/50" : "")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={cn("text-xs md:text-sm font-medium", lowStockItems.length > 0 ? "text-red-600" : "text-gray-500")}>Low Stock</CardTitle>
            <AlertTriangle className={cn("h-4 w-4 hidden sm:block", lowStockItems.length > 0 ? "text-red-600" : "text-gray-400")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-xl md:text-2xl font-bold", lowStockItems.length > 0 ? "text-red-700" : "text-gray-900")}>{lowStockItems.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[250px] md:h-[300px] w-full flex items-end justify-between gap-2 pt-4">
                {chartData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center justify-end h-full w-full group relative">
                    <div className="absolute -top-8 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      PKR {d.revenue.toFixed(2)}
                    </div>
                    <div 
                      className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-sm transition-all"
                      style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
                    />
                    <div className="text-[10px] md:text-xs text-gray-500 mt-2 truncate w-full text-center">
                      {d.name.split(' ')[0]}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[250px] md:h-[300px] flex items-center justify-center text-gray-500 text-sm">No sales data available</div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2 text-base md:text-lg">
                <AlertTriangle className="h-5 w-5" /> Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockItems.length > 0 ? (
                <div className="space-y-4">
                  {lowStockItems.map(item => (
                    <div key={item.ID} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.Name}</p>
                        <p className="text-xs text-gray-500">{item.SKU}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600 text-sm">{item.Quantity}</p>
                        <p className="text-xs text-gray-500">Min: {item.MinThreshold}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">All inventory levels are healthy.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
