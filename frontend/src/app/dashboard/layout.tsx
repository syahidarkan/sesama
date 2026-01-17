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
    X
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
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-emerald-600 to-blue-600 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-6 border-b border-white/20">
                        <div className="flex items-center gap-2">
                            <Heart className="w-8 h-8" />
                            <span className="text-xl font-bold">LAZISMU Admin</span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-6 border-b border-white/20">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="font-semibold">{user.name}</div>
                                <div className="text-xs text-white/70">{user.role.replace(/_/g, ' ')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 p-4 space-y-2">
                        {filteredMenuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-white text-emerald-600 shadow-lg'
                                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-white/20">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all w-full"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Keluar</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Top Bar */}
                <header className="bg-white border-b sticky top-0 z-40">
                    <div className="flex items-center justify-between px-6 py-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex-1 lg:flex-none">
                            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
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
