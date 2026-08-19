import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add Menu and X imports
content = content.replace("import { LayoutDashboard, Package, ShoppingCart, Settings, Droplet, Store } from 'lucide-react';",
                          "import { LayoutDashboard, Package, ShoppingCart, Settings, Droplet, Store, Menu, X } from 'lucide-react';")

# Add isMobileMenuOpen state
content = content.replace("const [currentPage, setCurrentPage] = useState<Page>('dashboard');",
                          "const [currentPage, setCurrentPage] = useState<Page>('dashboard');\n  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);")

# Add bottomNavItems array
navItems_decl = """  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'outlets', label: 'Outlets', icon: Store },
    { id: 'ledger', label: 'Ledger', icon: BookOpen },
    { id: 'sales', label: 'Orders', icon: ShoppingCart },
    { id: 'reports', label: 'Daily Report', icon: Droplet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;"""

bottomNavItems_decl = """  const bottomNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Orders', icon: ShoppingCart },
    { id: 'outlets', label: 'Outlets', icon: Store },
    { id: 'ledger', label: 'Ledger', icon: BookOpen },
  ] as const;"""

content = content.replace(navItems_decl, navItems_decl + "\n\n" + bottomNavItems_decl)

# Update Mobile Top Header
old_header = """      {/* Mobile Top Header */}
      <div className="md:hidden print:hidden bg-red-600 text-white p-4 flex items-center justify-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/warsa-logo.png" alt="Warsa Pure Water" className="h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.style.display = 'block'; }} />
          <Droplet className="h-5 w-5 fill-current hidden" />
          <span className="font-bold tracking-wider">WARSA PURE WATER</span>
        </div>
      </div>"""

new_header = """      {/* Mobile Top Header */}
      <div className="md:hidden print:hidden bg-red-600 text-white p-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 -ml-1">
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/warsa-logo.png" alt="Warsa Pure Water" className="h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.style.display = 'block'; }} />
          <Droplet className="h-5 w-5 fill-current hidden" />
          <span className="font-bold tracking-wider">WARSA PURE WATER</span>
        </div>
        <div className="w-6"></div>
      </div>
      
      {/* Mobile Slide Navigation (Drawer) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex flex-col w-64 max-w-[80%] bg-white h-full shadow-xl animate-in slide-in-from-left">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-red-600 text-white">
              <div className="flex items-center gap-2">
                <img src="/warsa-logo.png" alt="Warsa Pure Water" className="h-6 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <span className="font-bold tracking-wider text-sm">MENU</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setIsMobileMenuOpen(false);
                    }}
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
        </div>
      )}"""

content = content.replace(old_header, new_header)

# Update Mobile Bottom Navigation array reference
content = content.replace("      <div className=\"md:hidden print:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]\">\n        {navItems.map((item) => {",
                          "      <div className=\"md:hidden print:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex justify-around pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]\">\n        {bottomNavItems.map((item) => {")

with open('src/App.tsx', 'w') as f:
    f.write(content)
