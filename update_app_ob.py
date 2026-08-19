import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace("import { Outlets } from './pages/Outlets';",
                          "import { Outlets } from './pages/Outlets';\nimport { OrderBookers } from './pages/OrderBookers';")

# Add to Page type
content = content.replace("type Page = 'dashboard' | 'inventory' | 'sales' | 'outlets' | 'ledger' | 'reports' | 'settings';",
                          "type Page = 'dashboard' | 'inventory' | 'sales' | 'outlets' | 'ledger' | 'reports' | 'settings' | 'orderBookers';")

# Add to navItems
nav_target = "{ id: 'settings', label: 'Settings', icon: Settings },"
nav_replacement = "{ id: 'orderBookers', label: 'Order Bookers', icon: User },\n    { id: 'settings', label: 'Settings', icon: Settings },"
content = content.replace(nav_target, nav_replacement)

# Import User icon if not there
if "import { LayoutDashboard, Package, ShoppingCart, Settings, Droplet, Store, Menu, X } from 'lucide-react';" in content:
    content = content.replace("import { LayoutDashboard, Package, ShoppingCart, Settings, Droplet, Store, Menu, X } from 'lucide-react';",
                              "import { LayoutDashboard, Package, ShoppingCart, Settings, Droplet, Store, Menu, X, User } from 'lucide-react';")

# Add to renderPage
render_target = "case 'settings': return <SettingsPage />;"
render_replacement = "case 'orderBookers': return <OrderBookers />;\n      case 'settings': return <SettingsPage />;"
content = content.replace(render_target, render_replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
