'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import {
    LayoutDashboard,
    Heart,
    CheckCircle,
    Wallet,
    CreditCard,
    Users,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Home
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, isAuthenticated } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isAuthenticated()) {
            router.push('/login');
        }
    }, [mounted, isAuthenticated, router]);

    useEffect(() => {
        // Redirect FINANCE to admin finance page
        if (mounted && user?.role === 'FINANCE') {
            router.push('/admin/finance');
        }
        // Redirect PENGUSUL to admin dashboard (they should use admin panel)
        if (mounted && user?.role === 'PENGUSUL') {
            router.push('/admin/dashboard');
        }
        // Redirect all admin roles to admin dashboard
        if (mounted && user?.role && ['MANAGER', 'CONTENT_MANAGER', 'SUPERVISOR', 'SUPER_ADMIN'].includes(user.role)) {
            router.push('/admin/dashboard');
        }
    }, [mounted, user, router]);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const menuItems = [
        {
            name: 'Dashboard',
            icon: LayoutDashboard,
            href: '/dashboard',
            roles: ['USER'],
        },
        {
            name: 'Riwayat Donasi',
            icon: CreditCard,
            href: '/dashboard/donations',
            roles: ['USER'],
        },
    ];

    const filteredMenuItems = menuItems.filter((item) =>
        item.roles.includes(user?.role || '')
    );

    if (!mounted || !user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-60 bg-primary-900 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="px-5 py-4 border-b border-primary-800">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="text-lg font-bold text-white">
                                sesama
                            </Link>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden text-primary-300 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* User */}
                    <div className="px-5 py-3 border-b border-primary-800">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-sm font-medium text-white">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white truncate">{user.name}</div>
                                <div className="text-xs text-primary-400 truncate">{user.role.replace(/_/g, ' ')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                        {filteredMenuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${isActive
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
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-3 py-2 rounded text-sm text-primary-300 hover:text-white hover:bg-primary-800/60 transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            <span>Homepage</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2 rounded text-sm text-primary-300 hover:text-white hover:bg-primary-800/60 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="lg:pl-60">
                <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between px-5 h-14">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden text-gray-600 hover:text-gray-900"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <h1 className="text-sm font-semibold text-gray-900">
                                {pathname === '/dashboard' && 'Dashboard'}
                                {pathname === '/dashboard/programs' && 'Programs'}
                                {pathname === '/dashboard/approvals' && 'Approvals'}
                                {pathname === '/dashboard/wallet' && 'Wallet & Ledger'}
                                {pathname === '/dashboard/withdrawals' && 'Withdrawals'}
                                {pathname === '/dashboard/users' && 'Users'}
                            </h1>
                        </div>
                        <div className="text-xs text-gray-500">
                            {new Date().toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </header>
                <main className="p-3 sm:p-5">{children}</main>
            </div>

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    );
}
