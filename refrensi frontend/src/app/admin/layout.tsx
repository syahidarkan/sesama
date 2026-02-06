'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import {
  LayoutDashboard,
  Heart,
  FileText,
  Users,
  CheckCircle,
  Settings,
  Shield,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User as UserIcon,
  HelpCircle,
  File,
  Newspaper,
  DollarSign,
  Activity,
  Wallet,
  Share2,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated()) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Menu items based on role
  const getMenuItems = () => {
    const role = user?.role;
    const baseItems = [
      {
        name: 'Dashboard',
        icon: LayoutDashboard,
        href: '/admin/dashboard',
        roles: ['MANAGER', 'CONTENT_MANAGER', 'SUPERVISOR', 'SUPER_ADMIN', 'PENGUSUL'],
      },
      {
        name: 'Programs',
        icon: Heart,
        href: '/admin/programs',
        roles: ['MANAGER', 'CONTENT_MANAGER', 'SUPERVISOR', 'SUPER_ADMIN', 'PENGUSUL'],
      },
      {
        name: 'Articles',
        icon: FileText,
        href: '/admin/articles',
        roles: ['MANAGER', 'CONTENT_MANAGER', 'SUPERVISOR', 'SUPER_ADMIN', 'PENGUSUL'],
      },
      {
        name: 'News',
        icon: Newspaper,
        href: '/admin/berita',
        roles: ['MANAGER', 'CONTENT_MANAGER', 'SUPERVISOR', 'SUPER_ADMIN'],
      },
      {
        name: 'Donations',
        icon: DollarSign,
        href: '/admin/donations',
        roles: ['MANAGER', 'SUPERVISOR', 'SUPER_ADMIN'],
      },
      {
        name: 'Referrals',
        icon: Share2,
        href: '/dashboard/referrals',
        roles: ['PENGUSUL', 'MANAGER', 'SUPER_ADMIN'],
      },
      {
        name: 'Finance',
        icon: Wallet,
        href: '/admin/finance',
        roles: ['FINANCE', 'SUPER_ADMIN'],
      },
      {
        name: 'Approvals',
        icon: CheckCircle,
        href: '/admin/approvals',
        roles: ['MANAGER', 'SUPER_ADMIN'],
      },
      {
        name: 'Users',
        icon: Users,
        href: '/admin/users',
        roles: ['SUPER_ADMIN'],
      },
      {
        name: 'Files',
        icon: File,
        href: '/admin/files',
        roles: ['SUPER_ADMIN'],
      },
      {
        name: 'Reports',
        icon: Activity,
        href: '/admin/pelaporan',
        roles: ['MANAGER', 'SUPERVISOR', 'SUPER_ADMIN'],
      },
      {
        name: 'Audit Logs',
        icon: Shield,
        href: '/admin/audit-logs',
        roles: ['SUPER_ADMIN'],
      },
      {
        name: 'Settings',
        icon: Settings,
        href: '/admin/settings',
        roles: ['SUPER_ADMIN'],
      },
    ];

    return baseItems.filter((item) => item.roles.includes(role || ''));
  };

  const menuItems = getMenuItems();

  if (!mounted || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-gray-200">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-teal-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">Sesama</div>
                <div className="text-xs text-gray-500">Admin Panel</div>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-sm font-semibold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                <div className="text-xs text-gray-500 truncate">{user.role.replace(/_/g, ' ')}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-all hover:translate-x-1 ${
                    isActive
                      ? 'bg-teal-50 text-teal-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  <Icon
                    className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-3 border-t border-gray-200 space-y-1">
            <Link
              href="/admin/profile"
              className="group flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <UserIcon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-600" />
              <span>Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-600" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              {/* Search Bar */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <Link
                href="/admin/notifications"
                className="relative w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600 hover:scale-110 transition-transform" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full animate-pulse-slow"></span>
              </Link>

              {/* Help */}
              <Link
                href="/admin/help"
                className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
              >
                <HelpCircle className="w-5 h-5 text-gray-600 hover:scale-110 transition-transform" />
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-xs font-semibold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md border border-gray-200 shadow-lg z-20">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/admin/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setProfileOpen(false)}
                        >
                          <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                          Your Profile
                        </Link>
                        <Link
                          href="/admin/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-3 text-gray-400" />
                          Settings
                        </Link>
                      </div>
                      <div className="border-t border-gray-200 py-1">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="w-4 h-4 mr-3 text-gray-400" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
              <div className="mb-2 md:mb-0">
                © {new Date().getFullYear()} Sesama. All rights reserved.
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/privacy" className="hover:text-teal-600 transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-teal-600 transition-colors">
                  Terms
                </Link>
                <Link href="/contact" className="hover:text-teal-600 transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
