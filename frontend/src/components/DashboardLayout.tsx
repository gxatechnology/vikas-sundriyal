'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Shipment,
  Users,
  Receipt,
  ShieldCheck,
  Warehouse,
  Truck,
  Building2,
  UserCheck,
  FileText,
  LifeBuoy,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Bell,
  Search,
} from 'lucide-react';

// Map icon names
const icons: Record<string, React.ComponentType<any>> = {
  Dashboard: LayoutDashboard,
  Shipments: FileText, // fallback using FileText since we don't have direct Shipment icon in lucide
  Customers: Users,
  Billing: Receipt,
  Customs: ShieldCheck,
  Warehouses: Warehouse,
  Transportation: Truck,
  Vendors: Building2,
  Employees: UserCheck,
  Documents: FileText,
  Support: LifeBuoy,
};

interface SidebarItem {
  name: string;
  href: string;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'DOCUMENTATION_EXECUTIVE', 'CUSTOMS_EXECUTIVE', 'TRANSPORT_MANAGER', 'SALES_EXECUTIVE', 'CUSTOMER', 'ACCOUNTANT'] },
  { name: 'Shipments', href: '/shipments', roles: ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'DOCUMENTATION_EXECUTIVE', 'CUSTOMS_EXECUTIVE', 'TRANSPORT_MANAGER', 'SALES_EXECUTIVE', 'CUSTOMER', 'ACCOUNTANT'] },
  { name: 'Customers', href: '/customers', roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_EXECUTIVE', 'ACCOUNTANT', 'OPERATIONS_MANAGER'] },
  { name: 'Billing', href: '/billing', roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'SALES_EXECUTIVE'] },
  { name: 'Customs', href: '/customs', roles: ['SUPER_ADMIN', 'ADMIN', 'CUSTOMS_EXECUTIVE', 'OPERATIONS_MANAGER'] },
  { name: 'Warehouses', href: '/warehouses', roles: ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER'] },
  { name: 'Transportation', href: '/transportation', roles: ['SUPER_ADMIN', 'ADMIN', 'TRANSPORT_MANAGER', 'OPERATIONS_MANAGER'] },
  { name: 'Vendors', href: '/vendors', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { name: 'Employees', href: '/employees', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { name: 'Documents', href: '/documents', roles: ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'DOCUMENTATION_EXECUTIVE', 'CUSTOMER'] },
  { name: 'Support', href: '/support', roles: ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, logout, initAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Modern default dark mode
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([
    'Shipment GXA-SH-10002 has been successfully delivered.',
    'Invoice GXA-INV-20002 has been generated.',
    'New customs entry registered for GXA-SH-10001.',
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [globalSearchText, setGlobalSearchText] = useState('');

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Auth checking redirection
  useEffect(() => {
    // Only redirect if pathname is not tracking or login
    if (pathname === '/login' || pathname === '/tracking' || pathname === '/') {
      return;
    }
    const storedToken = localStorage.getItem('token');
    if (!storedToken && !token) {
      router.push('/login');
    }
  }, [token, pathname, router]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  if (pathname === '/login' || pathname === '/tracking' || pathname === '/') {
    return <div className="min-h-screen bg-slate-900 text-slate-100">{children}</div>;
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearchText.trim()) {
      router.push(`/shipments?search=${encodeURIComponent(globalSearchText)}`);
    }
  };

  const filteredItems = sidebarItems.filter((item) => item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col z-20`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              GXA
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent truncate">
                GXA Technologies
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Sidebar Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const Icon = icons[item.name] || FileText;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={20} className={isActive ? '' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
                {sidebarOpen && <span className="text-sm truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          {sidebarOpen && (
            <div className="mb-2 p-2 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
              <p className="text-xs text-slate-400 font-semibold truncate">{user.name}</p>
              <p className="text-[10px] text-blue-500 font-bold truncate">
                {user.role.replace('_', ' ')}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-10">
          {/* Left: Global Search */}
          <form onSubmit={handleGlobalSearch} className="relative w-64 max-w-lg hidden sm:block">
            <input
              type="text"
              placeholder="Search shipment/invoice..."
              value={globalSearchText}
              onChange={(e) => setGlobalSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-slate-200 dark:focus:border-slate-700 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </form>

          {/* Right: Actions */}
          <div className="flex items-center gap-4 ml-auto sm:ml-0">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 relative"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    <button
                      onClick={() => setNotifications([])}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No new notifications</p>
                    ) : (
                      notifications.map((notif, index) => (
                        <div
                          key={index}
                          className="p-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                        >
                          {notif}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

            {/* User Badge */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 capitalize leading-none">
                  {user.role.toLowerCase().replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-950/40">
          {children}
        </main>
      </div>
    </div>
  );
}
