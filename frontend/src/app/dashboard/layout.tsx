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
    ChevronRight
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

    // Redirect FINANCE role to admin finance dashboard
    useEffect(() => {
        if (mounted && user?.role === 'FINANCE') {
            router.push('/admin/finance');
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
            roles: ['ADMIN_LAZISMU', 'ADMIN_LEMBAGA_ISLAMI', 'ADMIN_IT', 'DEVELOPER'],
        },
        {
            name: 'Program',
            icon: Heart,
            href: '/dashboard/programs',
            roles: ['ADMIN_LAZISMU', 'ADMIN_LEMBAGA_ISLAMI', 'ADMIN_IT', 'DEVELOPER'],
        },
        {
            name: 'Persetujuan',
            icon: CheckCircle,
            href: '/dashboard/approvals',
            roles: ['ADMIN_LAZISMU', 'ADMIN_LEMBAGA_ISLAMI', 'ADMIN_IT', 'DEVELOPER'],
        },
        {
            name: 'Dompet & Ledger',
            icon: Wallet,
            href: '/dashboard/wallet',
            roles: ['ADMIN_LAZISMU', 'ADMIN_LEMBAGA_ISLAMI', 'ADMIN_IT', 'DEVELOPER'],
        },
        {
            name: 'Pencairan Dana',
            icon: CreditCard,
            href: '/dashboard/withdrawals',
            roles: ['ADMIN_LAZISMU', 'ADMIN_LEMBAGA_ISLAMI', 'ADMIN_IT', 'DEVELOPER'],
        },
        {
            name: 'Pengguna',
            icon: Users,
            href: '/dashboard/users',
            roles: ['DEVELOPER'],
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
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo & Brand */}
                    <div className="px-6 py-5 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                                    <Heart className="w-4.5 h-4.5 text-white" fill="currentColor" />
                                </div>
                                <div className="text-lg font-semibold text-gray-900">
                                    Sesama
                                </div>
                            </Link>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-4.5 h-4.5 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-sm font-medium text-white">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                                <div className="text-xs text-gray-500 truncate">{user.role.replace(/_/g, ' ')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                        {filteredMenuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`group flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                        ? 'bg-orange-600 text-white'
                                        : 'text-gray-700 hover:bg-orange-50'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-orange-600'}`} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="p-3 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="group flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <LogOut className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-600" />
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Top Bar */}
                <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                            >
                                <Menu className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    {pathname === '/dashboard' && 'Dashboard'}
                                    {pathname === '/dashboard/programs' && 'Programs'}
                                    {pathname === '/dashboard/approvals' && 'Approvals'}
                                    {pathname === '/dashboard/wallet' && 'Wallet & Ledger'}
                                    {pathname === '/dashboard/withdrawals' && 'Withdrawals'}
                                    {pathname === '/dashboard/users' && 'Users'}
                                </h1>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center">
                            <div className="text-sm text-gray-500">
                                {new Date().toLocaleDateString('id-ID', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">{children}</main>
            </div>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
}
