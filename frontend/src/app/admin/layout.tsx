'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import {
  LayoutDashboard, Heart, FileText, Users, CheckCircle, Settings,
  Shield, Menu, X, Bell, Search, ChevronDown, LogOut,
  User as UserIcon, HelpCircle, File, Newspaper, DollarSign,
  Activity, Wallet, Home,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated()) router.push('/login');
  }, [mounted, isAuthenticated, router]);

  const handleLogout = () => { logout(); router.push('/login'); };

  const getMenuItems = () => {
    const role = user?.role;
    const items = [
      { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard', roles: ['MANAGER', 'CONTENT_MANAGER', 'SUPERVISOR', 'SUPER_ADMIN', 'PENGUSUL'] },
      { name: 'Programs', icon: Heart, href: '/admin/programs', roles: ['MANAGER', 'CONTENT_MANAGER', 'SUPERVISOR', 'SUPER_ADMIN', 'PENGUSUL'] },
      { name: 'Articles', icon: FileText, href: '/admin/articles', roles: ['MANAGER', 'CONTENT_MANAGER', 'SUPERVISOR', 'SUPER_ADMIN'] },
      { name: 'News', icon: Newspaper, href: '/admin/berita', roles: ['MANAGER', 'CONTENT_MANAGER', 'SUPERVISOR', 'SUPER_ADMIN'] },
      { name: 'Donations', icon: DollarSign, href: '/admin/donations', roles: ['MANAGER', 'SUPERVISOR', 'SUPER_ADMIN'] },
      { name: 'Finance', icon: Wallet, href: '/admin/finance', roles: ['FINANCE', 'SUPER_ADMIN'] },
      { name: 'Approvals', icon: CheckCircle, href: '/admin/approvals', roles: ['MANAGER', 'SUPER_ADMIN'] },
      { name: 'Users', icon: Users, href: '/admin/users', roles: ['SUPER_ADMIN'] },
      { name: 'Files', icon: File, href: '/admin/files', roles: ['MANAGER', 'SUPER_ADMIN'] },
      { name: 'Reports', icon: Activity, href: '/admin/pelaporan', roles: ['MANAGER', 'CONTENT_MANAGER', 'SUPERVISOR', 'SUPER_ADMIN', 'PENGUSUL'] },
      { name: 'Audit Logs', icon: Shield, href: '/admin/audit-logs', roles: ['SUPER_ADMIN'] },
      { name: 'Settings', icon: Settings, href: '/admin/settings', roles: ['SUPER_ADMIN'] },
    ];
    return items.filter((i) => i.roles.includes(role || ''));
  };

  const menuItems = getMenuItems();

  if (!mounted || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-primary-900 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-5 py-4 border-b border-primary-800">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-lg font-bold text-white">SobatBantu</Link>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-primary-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-primary-400 mt-0.5">
              {user?.role === 'PENGUSUL' ? 'Dashboard Pengusul' : 'Admin Panel'}
            </div>
          </div>

          {/* User */}
          <div className="px-5 py-3 border-b border-primary-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-sm font-medium text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white truncate">{user.name}</div>
                <div className="text-xs text-primary-400 truncate">{user.role.replace(/_/g, ' ')}</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                    isActive
                      ? 'bg-primary-800 text-white font-medium'
                      : 'text-primary-300 hover:text-white hover:bg-primary-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-primary-800 space-y-0.5">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded text-sm text-primary-300 hover:text-white hover:bg-primary-800/60 transition-colors">
              <Home className="w-4 h-4" />
              <span>Homepage</span>
            </Link>
            <Link href="/admin/profile" className="flex items-center gap-3 px-3 py-2 rounded text-sm text-primary-300 hover:text-white hover:bg-primary-800/60 transition-colors">
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded text-sm text-primary-300 hover:text-white hover:bg-primary-800/60 transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-5 h-14">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900">
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search..." className="pl-9 pr-3 py-1.5 w-full max-w-56 text-sm border border-gray-200 rounded focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/notifications" className="relative w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100">
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-600 rounded-full" />
              </Link>
              <Link href="/admin/help" className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100">
                <HelpCircle className="w-4 h-4 text-gray-600" />
              </Link>
              <div className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100">
                  <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-xs font-medium text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-1 w-52 bg-white rounded border border-gray-200 shadow-lg z-20">
                      <div className="px-3 py-2.5 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      <div className="py-1">
                        <Link href="/admin/profile" className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>
                          <UserIcon className="w-4 h-4 text-gray-400" /> Profile
                        </Link>
                        <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>
                          <Settings className="w-4 h-4 text-gray-400" /> Settings
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 py-1">
                        <button onClick={() => { setProfileOpen(false); handleLogout(); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                          <LogOut className="w-4 h-4 text-gray-400" /> Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="p-3 sm:p-5">{children}</main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
