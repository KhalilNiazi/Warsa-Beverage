/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Settings, Droplet, Store } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Sales } from './pages/Sales';
import { SettingsPage } from './pages/Settings';
import { Outlets } from './pages/Outlets';
import { DailyReport } from './pages/DailyReport';
import { Ledger } from './pages/Ledger';
import { BookOpen } from 'lucide-react';

type Page = 'dashboard' | 'inventory' | 'sales' | 'outlets' | 'ledger' | 'reports' | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'outlets', label: 'Outlets', icon: Store },
    { id: 'ledger', label: 'Ledger', icon: BookOpen },
    { id: 'sales', label: 'Orders', icon: ShoppingCart },
    { id: 'reports', label: 'Daily Report', icon: Droplet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory />;
      case 'outlets': return <Outlets />;
      case 'ledger': return <Ledger />;
      case 'sales': return <Sales />;
      case 'reports': return <DailyReport />;
      case 'settings': return <SettingsPage />;
    }
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-gray-50 flex flex-col md:flex-row font-sans print:h-auto print:overflow-visible print:block">
      {/* Mobile Top Header */}
      <div className="md:hidden print:hidden bg-red-600 text-white p-4 flex items-center justify-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/warsa-logo.png" alt="Warsa Pure Water" className="h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.style.display = 'block'; }} />
          <Droplet className="h-5 w-5 fill-current hidden" />
          <span className="font-bold tracking-wider">WARSA PURE WATER</span>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex print:hidden flex-col w-64 bg-white border-r border-gray-200 flex-shrink-0 z-10 sticky top-0 h-screen">
        <div className="flex flex-col items-center gap-3 p-6 border-b border-gray-100 bg-red-600 text-white relative overflow-hidden">
          <img src="/warsa-logo.png" alt="Warsa Pure Water Logo" className="w-full h-auto object-contain max-w-[160px] z-10 drop-shadow-md" onError={(e) => {
            e.currentTarget.style.display = 'none';
            document.getElementById('fallback-logo')!.style.display = 'flex';
          }} />
          
          <div id="fallback-logo" className="hidden flex-col items-center gap-3 w-full z-10">
            <div className="bg-white p-1.5 rounded-full shadow-sm">
              <Droplet className="h-6 w-6 text-red-600 fill-current" />
            </div>
            <div className="flex flex-col text-center">
              <span className="text-xs font-medium text-red-100 uppercase tracking-widest leading-none mb-1">2 Abbot Road Lahore</span>
              <span className="font-bold text-xl leading-none tracking-wider">WARSA</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-red-50 text-red-700" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-red-600" : "text-gray-400")} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden print:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full py-3 space-y-1 transition-colors",
                isActive ? "text-red-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-red-600" : "text-gray-400")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full relative overflow-y-auto pb-20 md:pb-0 no-scrollbar print:overflow-visible print:h-auto print:block">
        {renderPage()}
      </main>
    </div>
  );
}
