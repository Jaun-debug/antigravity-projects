"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Calculator,
    LayoutDashboard,
    Users,
    FileText,
    Zap,
    BarChart3,
    Settings,
    CreditCard,
    History,
    Menu,
    X,
    Search,
    CalendarDays,
    Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Statements', href: '/statements', icon: History },
    { name: 'AI Extraction', href: '/extraction', icon: Zap },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Expenses', href: '/expenses', icon: CreditCard },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Smart Search', href: '/search', icon: Search },
    { name: 'Financial Calendar', href: '/calendar', icon: CalendarDays },
    { name: 'Net Worth', href: '/net-worth', icon: Wallet },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-neutral-100 z-50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-emerald-600">
                    <div className="p-2 bg-emerald-50 rounded-xl">
                        <Calculator className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-neutral-900">Accountant.AI</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-neutral-50 rounded-xl transition-colors"
                >
                    {isOpen ? <X className="w-6 h-6 text-neutral-600" /> : <Menu className="w-6 h-6 text-neutral-600" />}
                </button>
            </div>

            {/* Sidebar / Mobile Menu */}
            <div className={cn(
                "w-64 bg-white border-r border-neutral-100 flex flex-col h-screen fixed left-0 top-0 z-40 transition-transform duration-300 lg:translate-x-0",
                isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="p-6 hidden lg:block">
                    <div className="flex items-center gap-3 text-emerald-600 mb-8 px-2">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                            <Calculator className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-neutral-900">Accountant.AI</span>
                    </div>
                </div>

                <div className="flex-1 px-6 pt-24 lg:pt-0 overflow-y-auto">
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                                        isActive
                                            ? "bg-emerald-50 text-emerald-700 shadow-sm"
                                            : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "w-5 h-5",
                                        isActive ? "text-emerald-600" : "text-neutral-400 group-hover:text-neutral-600"
                                    )} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-neutral-100">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-neutral-200 border-2 border-white shadow-sm overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-neutral-900 leading-none">John Accountant</span>
                            <span className="text-[10px] text-neutral-500 font-medium mt-1 uppercase tracking-wider">Premium Plan</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
